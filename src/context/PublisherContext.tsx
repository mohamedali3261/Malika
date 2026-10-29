import { useStore } from "@/context/StoreContext";
import { usePersistentState } from "@/hooks/usePersistentState";
import {
  GithubError,
  checkAccess,
  hashString,
  isLive,
  parseRepo,
  publishCatalog,
  type AccessReport,
} from "@/lib/github";
import { clearSession, loadSession, saveSession } from "@/lib/githubAuth";
import { commitDrafts, countDirtyDrafts, subscribeDrafts } from "@/lib/studioDrafts";
import type { GitHubSession, GithubConfig } from "@/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

/* The site is "live" once the host has rebuilt and served the new catalogue. */
const FIRST_POLL_MS = 3_000;
const POLL_MS = 4_000;
const DEPLOY_TIMEOUT_MS = 6 * 60 * 1000;
const HASH_KEY = "malika.publish.hash.v1";

export const defaultGithubConfig: GithubConfig = {
  owner: "",
  repo: "",
  branch: "main",
  path: "src/data/products/catalog.json",
};

export type PublishPhase =
  | "idle"
  | "working" // saving drafts / uploading
  | "deploying" // committed, waiting for the host to rebuild
  | "live" // new version confirmed on the site
  | "unconfirmed" // committed, but no rebuild seen in time
  | "uptodate" // nothing changed since the last publish
  | "error";

export interface PublishOutcome {
  commitUrl?: string;
  generatedAt: string;
  at: string;
  bytes: number;
  productCount: number;
}

export type PanelState = "closed" | "status" | "setup";

interface PublisherValue {
  config: GithubConfig;
  updateConfig: (patch: Partial<GithubConfig>) => void;
  session: GitHubSession | null;
  setSession: (session: GitHubSession | null) => void;
  /** Repository and token are both present. */
  ready: boolean;
  phase: PublishPhase;
  step: "saving" | "uploading" | null;
  error: unknown;
  outcome: PublishOutcome | null;
  panel: PanelState;
  openPanel: (panel: Exclude<PanelState, "closed">) => void;
  closePanel: () => void;
  /** Editors holding edits that have not been saved yet. */
  pendingDrafts: number;
  publish: (options?: { force?: boolean }) => Promise<void>;
  connect: (input: { repo: string; branch: string; token: string; remember: boolean }) => Promise<AccessReport>;
  disconnect: () => void;
}

const PublisherContext = createContext<PublisherValue | null>(null);

export function PublisherProvider({ children }: { children: ReactNode }) {
  const { products, settings, content, markPublished } = useStore();
  const [config, setConfig] = usePersistentState<GithubConfig>("malika.github.config.v1", defaultGithubConfig);
  const [session, setSessionState] = useState<GitHubSession | null>(() => loadSession());

  const [phase, setPhase] = useState<PublishPhase>("idle");
  const [step, setStep] = useState<"saving" | "uploading" | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [outcome, setOutcome] = useState<PublishOutcome | null>(null);
  const [panel, setPanel] = useState<PanelState>("closed");

  const pendingDrafts = useSyncExternalStore(subscribeDrafts, countDirtyDrafts, () => 0);

  // Always read the freshest values inside async work without re-creating it.
  const latest = useRef({ products, settings, content, config, session });
  latest.current = { products, settings, content, config, session };
  const busy = useRef(false);

  const ready = Boolean(session?.token && config.owner && config.repo);

  const updateConfig = useCallback(
    (patch: Partial<GithubConfig>) => setConfig((previous) => ({ ...previous, ...patch })),
    [setConfig]
  );

  const setSession = useCallback((next: GitHubSession | null) => setSessionState(next), []);

  const publish = useCallback(
    async (options?: { force?: boolean }) => {
      if (busy.current) return;
      const current = latest.current;

      if (!current.session?.token || !current.config.owner || !current.config.repo) {
        setPanel("setup");
        return;
      }

      busy.current = true;
      setPanel("status");
      setError(null);
      setPhase("working");
      setStep("saving");

      try {
        if (!/\.json$/i.test(current.config.path.trim())) {
          throw new GithubError("invalid", 422, "The file path must end in .json.");
        }

        // 1. Anything still sitting in an editor is saved first.
        const committed = commitDrafts();
        const nextSettings = committed.settings ?? current.settings;
        const nextContent = committed.content ?? current.content;

        // 2. Skip pointless commits — every commit triggers a rebuild on the host.
        const fingerprint = hashString(JSON.stringify({ products: current.products, settings: nextSettings, content: nextContent }));
        if (!options?.force && fingerprint === localStorage.getItem(HASH_KEY)) {
          setPhase("uptodate");
          return;
        }

        // 3. One atomic commit.
        setStep("uploading");
        const generatedAt = new Date().toISOString();
        const result = await publishCatalog(
          current.config,
          current.session.token,
          { products: current.products, settings: nextSettings, content: nextContent, generatedAt },
          `${current.products.length} products`
        );

        try {
          localStorage.setItem(HASH_KEY, fingerprint);
        } catch {
          /* storage full or blocked: the next publish simply will not be skipped */
        }
        markPublished(generatedAt);
        setOutcome({
          commitUrl: result.commitUrl,
          generatedAt,
          at: generatedAt,
          bytes: result.bytes,
          productCount: current.products.length,
        });
        setPhase("deploying");
      } catch (caught) {
        setError(caught);
        setPhase("error");
      } finally {
        busy.current = false;
        setStep(null);
      }
    },
    [markPublished]
  );

  /* After a commit, watch the site itself for the new catalogue to appear. */
  useEffect(() => {
    if (phase !== "deploying" || !outcome) return;
    let cancelled = false;
    let timer = 0;
    const started = Date.now();

    const poll = async () => {
      if (cancelled) return;
      if (await isLive(outcome.generatedAt)) {
        if (!cancelled) setPhase("live");
        return;
      }
      if (Date.now() - started > DEPLOY_TIMEOUT_MS) {
        if (!cancelled) setPhase("unconfirmed");
        return;
      }
      timer = window.setTimeout(poll, POLL_MS);
    };

    timer = window.setTimeout(poll, FIRST_POLL_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [phase, outcome]);

  /** Verify the repository and token, then remember them. */
  const connect = useCallback<PublisherValue["connect"]>(
    async ({ repo, branch, token, remember }) => {
      const parsed = parseRepo(repo);
      if (!parsed) throw new GithubError("invalid", 422, "Repository must look like owner/name.");
      const cleanToken = token.trim();
      if (!cleanToken) throw new GithubError("auth", 401, "Paste the token first.");

      const report = await checkAccess({ owner: parsed.owner, repo: parsed.repo, branch }, cleanToken);
      if (report.canPush === false) throw new GithubError("forbidden", 403, "No push access to this repository.");
      if (!report.branchOk) throw new GithubError("notfound", 404, `Branch “${report.branch}” does not exist.`);

      setConfig((previous) => ({ ...previous, owner: report.owner, repo: report.repo, branch: report.branch }));
      const next: GitHubSession = {
        token: cleanToken,
        login: report.owner,
        method: "token",
        connectedAt: new Date().toISOString(),
      };
      saveSession(next, remember);
      setSessionState(next);
      // "Save & publish" calls publish() in the same tick, before React has
      // re-rendered. Without this, publish() would still see the old (empty)
      // session and send the owner straight back to the setup screen.
      latest.current = {
        ...latest.current,
        session: next,
        config: { ...latest.current.config, owner: report.owner, repo: report.repo, branch: report.branch },
      };
      return report;
    },
    [setConfig]
  );

  const disconnect = useCallback(() => {
    clearSession();
    setSessionState(null);
    setPhase("idle");
    setError(null);
    setPanel("closed");
  }, []);

  const value = useMemo<PublisherValue>(
    () => ({
      config,
      updateConfig,
      session,
      setSession,
      ready,
      phase,
      step,
      error,
      outcome,
      panel,
      openPanel: (next) => setPanel(next),
      closePanel: () => setPanel("closed"),
      pendingDrafts,
      publish,
      connect,
      disconnect,
    }),
    [config, updateConfig, session, setSession, ready, phase, step, error, outcome, panel, pendingDrafts, publish, connect, disconnect]
  );

  return <PublisherContext.Provider value={value}>{children}</PublisherContext.Provider>;
}

export function usePublisher() {
  const ctx = useContext(PublisherContext);
  if (!ctx) throw new Error("usePublisher must be used inside PublisherProvider");
  return ctx;
}
