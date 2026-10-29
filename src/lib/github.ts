import type { GithubConfig, GithubPublishResult } from "@/types";

const API = "https://api.github.com";

/* ------------------------------------------------------------------ *
 * Errors
 * ------------------------------------------------------------------ */

export type GithubErrorKind =
  | "auth" // 401 — token wrong, expired or revoked
  | "forbidden" // 403 — token lacks Contents: write, or SSO not authorised
  | "notfound" // 404 — repo / branch / path wrong, or token cannot see the repo
  | "conflict" // 409 / stale sha — somebody else committed in between
  | "ratelimit"
  | "toolarge"
  | "invalid"
  | "network" // fetch itself failed: offline, blocked, DNS
  | "unknown";

export class GithubError extends Error {
  readonly kind: GithubErrorKind;
  readonly status: number;

  constructor(kind: GithubErrorKind, status: number, detail?: string) {
    super(detail || kind);
    this.name = "GithubError";
    this.kind = kind;
    this.status = status;
  }
}

type Say = (en: string, ar: string) => string;

/** Human wording for an error, in the active language. `fix` says what to do next. */
export function explainError(error: unknown, x: Say): { title: string; fix: string } {
  const kind: GithubErrorKind = error instanceof GithubError ? error.kind : "unknown";
  switch (kind) {
    case "auth":
      return {
        title: x("GitHub rejected the token", "رفض GitHub التوكن"),
        fix: x("It is wrong, expired or revoked. Create a new one and paste it again.", "إما خاطئ أو منتهي أو ملغى. أنشئ توكن جديد والصقه."),
      };
    case "forbidden":
      return {
        title: x("The token cannot write to this repository", "التوكن لا يملك صلاحية الكتابة على المستودع"),
        fix: x(
          "Give it Repository access → this repo, and Permissions → Contents: Read and write. If the repo belongs to an organisation, authorise the token for it.",
          "امنحه الوصول لهذا المستودع وصلاحية Contents: Read and write. وإن كان المستودع لمنظمة فصرّح له من إعدادات المنظمة."
        ),
      };
    case "notfound":
      return {
        title: x("Repository or branch not found", "المستودع أو الفرع غير موجود"),
        fix: x(
          "Check the name and branch. For a private repository, GitHub also says “not found” when the token has no access to it.",
          "تأكد من الاسم والفرع. وفي المستودع الخاص يقول GitHub «غير موجود» أيضاً إن لم يكن للتوكن حق الوصول إليه."
        ),
      };
    case "conflict":
      return {
        title: x("The file changed on GitHub while you were publishing", "تغيّر الملف على GitHub أثناء النشر"),
        fix: x("Someone else (or another device) published at the same moment. Press Publish again.", "نشر شخص آخر أو جهاز آخر في نفس اللحظة. اضغط نشر مرة أخرى."),
      };
    case "ratelimit":
      return {
        title: x("GitHub says to slow down", "GitHub يطلب التمهّل"),
        fix: x("Too many requests. Wait a few minutes and try again.", "طلبات كثيرة. انتظر دقائق ثم حاول."),
      };
    case "toolarge":
      return {
        title: x("The catalogue is too large to publish", "الكتالوج أكبر من أن يُنشر"),
        fix: x("Replace uploaded images with image links, then publish again.", "استبدل الصور المرفوعة بروابط صور ثم انشر مجدداً."),
      };
    case "invalid":
      return {
        title: x("GitHub did not accept the file", "لم يقبل GitHub الملف"),
        fix: x("Check the file path in Advanced settings; it must be a .json file, not a folder.", "راجع مسار الملف في الإعدادات المتقدمة؛ يجب أن يكون ملف .json لا مجلداً."),
      };
    case "network":
      return {
        title: x("Could not reach GitHub", "تعذّر الوصول إلى GitHub"),
        fix: x("Check your internet connection, or an ad/privacy blocker, and try again. Nothing was changed.", "تحقق من الإنترنت أو من أي مانع إعلانات، ثم حاول. لم يتغير شيء."),
      };
    default:
      return {
        title: x("Publishing failed", "فشل النشر"),
        fix: error instanceof Error && error.message ? error.message : x("Try again in a moment.", "حاول مجدداً بعد قليل."),
      };
  }
}

/* ------------------------------------------------------------------ *
 * Low-level request helpers
 * ------------------------------------------------------------------ */

const authHeaders = (token: string): Record<string, string> => ({
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${token}`,
  "X-GitHub-Api-Version": "2022-11-28",
});

async function request(path: string, token: string, init?: RequestInit & { json?: unknown }): Promise<Response> {
  try {
    return await fetch(`${API}${path}`, {
      method: init?.method ?? "GET",
      headers: { ...authHeaders(token), ...(init?.json !== undefined ? { "Content-Type": "application/json" } : {}) },
      body: init?.json !== undefined ? JSON.stringify(init.json) : undefined,
    });
  } catch {
    throw new GithubError("network", 0);
  }
}

async function fail(response: Response): Promise<never> {
  const body = (await response.json().catch(() => ({}))) as { message?: unknown };
  const detail = typeof body.message === "string" ? body.message : "";
  const status = response.status;

  let kind: GithubErrorKind = "unknown";
  if (status === 401) kind = "auth";
  else if (status === 403) kind = response.headers.get("x-ratelimit-remaining") === "0" || /rate limit/i.test(detail) ? "ratelimit" : "forbidden";
  else if (status === 404) kind = "notfound";
  else if (status === 409) kind = "conflict";
  else if (status === 413) kind = "toolarge";
  else if (status === 422) kind = /sha|does not match/i.test(detail) ? "conflict" : "invalid";
  else if (status === 429) kind = "ratelimit";
  throw new GithubError(kind, status, detail);
}

const enc = encodeURIComponent;
const repoPath = (c: Pick<GithubConfig, "owner" | "repo">) => `/repos/${enc(c.owner)}/${enc(c.repo)}`;
const filePath = (c: GithubConfig) =>
  `${repoPath(c)}/contents/${c.path.replace(/^\/+/, "").split("/").map(enc).join("/")}`;

function toBase64Utf8(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(binary);
}

/* ------------------------------------------------------------------ *
 * Small pure helpers
 * ------------------------------------------------------------------ */

/**
 * Accepts "owner/repo", "https://github.com/owner/repo(.git)", ".../tree/main",
 * "git@github.com:owner/repo.git" — whatever the owner pastes.
 */
export function parseRepo(input: string): { owner: string; repo: string } | null {
  let text = input.trim().replace(/\.git$/i, "");
  const at = text.search(/github\.com[/:]/i);
  if (at >= 0) text = text.slice(at).replace(/^github\.com[/:]/i, "");
  const parts = text.split(/[/?#]/).filter(Boolean);
  if (parts.length < 2 || (at < 0 && parts.length !== 2)) return null;
  const [owner, repo] = parts;
  if (!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/.test(owner) || !/^[A-Za-z0-9._-]{1,100}$/.test(repo)) return null;
  return { owner, repo: repo.replace(/\.git$/i, "") };
}

/** Fast non-cryptographic hash, used only to notice "nothing changed". */
export function hashString(value: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < value.length; i += 1) {
    const ch = value.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

/**
 * Link that opens GitHub's "new fine-grained token" form already filled in:
 * name, expiry, resource owner and Contents: write. Parameters per GitHub docs
 * ("Pre-filling fine-grained personal access token details using URL parameters").
 * The owner still has to pick the single repository on that page.
 */
export function tokenCreationUrl(owner?: string, days = 90): string {
  const params = new URLSearchParams({
    name: "Malika studio",
    description: "Lets the Malika studio publish catalog.json to this repository. Nothing else.",
    expires_in: String(days),
    contents: "write",
  });
  if (owner) params.set("target_name", owner);
  return `https://github.com/settings/personal-access-tokens/new?${params.toString()}`;
}

/* ------------------------------------------------------------------ *
 * Access check ("Test connection")
 * ------------------------------------------------------------------ */

export interface AccessReport {
  owner: string;
  repo: string;
  isPrivate: boolean;
  defaultBranch: string;
  branch: string;
  branchOk: boolean;
  /**
   * The repo endpoint reports the *account's* permission, not the token's
   * scope, so `true` is not proof the token can write. `false` is conclusive.
   */
  canPush: boolean | null;
}

export async function checkAccess(
  config: Pick<GithubConfig, "owner" | "repo" | "branch">,
  token: string
): Promise<AccessReport> {
  const response = await request(repoPath(config), token);
  if (!response.ok) await fail(response);
  const info = (await response.json()) as {
    full_name?: string;
    private?: boolean;
    default_branch?: string;
    permissions?: { push?: boolean };
  };

  const [owner = config.owner, repo = config.repo] = (info.full_name ?? `${config.owner}/${config.repo}`).split("/");
  const defaultBranch = info.default_branch ?? "main";
  const branch = config.branch.trim() || defaultBranch;

  const branchResponse = await request(`${repoPath({ owner, repo })}/branches/${enc(branch)}`, token);
  if (!branchResponse.ok && branchResponse.status !== 404) await fail(branchResponse);

  return {
    owner,
    repo,
    isPrivate: Boolean(info.private),
    defaultBranch,
    branch,
    branchOk: branchResponse.ok,
    canPush: typeof info.permissions?.push === "boolean" ? info.permissions.push : null,
  };
}

/* ------------------------------------------------------------------ *
 * Publishing
 * ------------------------------------------------------------------ */

export interface CatalogPayload {
  products: unknown;
  settings?: unknown;
  content?: unknown;
  generatedAt: string;
}

export type PublishOutcome = GithubPublishResult & { bytes: number };

async function currentSha(config: GithubConfig, token: string): Promise<string | undefined> {
  const response = await request(`${filePath(config)}?ref=${enc(config.branch || "main")}`, token);
  if (response.status === 404) return undefined; // first publish: the file does not exist yet
  if (!response.ok) await fail(response);
  const data = (await response.json()) as { sha?: string } | unknown[];
  if (Array.isArray(data)) throw new GithubError("invalid", 422, "The path points to a folder.");
  return data.sha;
}

/**
 * Commit the catalogue. The Contents API needs the current file's SHA, which
 * can go stale if anything else commits in between — in that case the SHA is
 * fetched again and the write retried once, instead of surfacing a conflict
 * the owner can do nothing about.
 */
export async function publishCatalog(
  config: GithubConfig,
  token: string,
  payload: CatalogPayload,
  note?: string
): Promise<PublishOutcome> {
  if (!config.owner || !config.repo || !token) throw new GithubError("auth", 401, "Repository and token are required.");

  const text = JSON.stringify(payload, null, 2);
  const bytes = new TextEncoder().encode(text).length;
  const content = toBase64Utf8(text);
  const message = `catalogue: update storefront${note ? ` · ${note}` : ""} · ${new Date().toISOString().slice(0, 16).replace("T", " ")}`;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const sha = await currentSha(config, token);
    const response = await request(filePath(config), token, {
      method: "PUT",
      json: { message, content, branch: config.branch || "main", ...(sha ? { sha } : {}) },
    });

    if (response.ok) {
      const data = (await response.json().catch(() => ({}))) as {
        commit?: { html_url?: string };
        content?: { html_url?: string };
      };
      return { commitUrl: data.commit?.html_url, contentUrl: data.content?.html_url, message, bytes };
    }

    try {
      await fail(response);
    } catch (error) {
      if (attempt === 0 && error instanceof GithubError && error.kind === "conflict") continue;
      throw error;
    }
  }
  throw new GithubError("conflict", 409);
}

/* ------------------------------------------------------------------ *
 * "Is it live yet?"
 * ------------------------------------------------------------------ */

/**
 * The site is one HTML file with catalog.json inlined, so once the host has
 * rebuilt, the new `generatedAt` stamp appears inside the page itself. That is
 * a real confirmation, not a guess about build times.
 */
export async function isLive(stamp: string): Promise<boolean> {
  try {
    const url = new URL(window.location.href);
    url.hash = "";
    url.searchParams.set("_", String(Date.now()));
    const response = await fetch(url.toString(), { cache: "no-store" });
    if (!response.ok) return false;
    return (await response.text()).includes(stamp);
  } catch {
    return false;
  }
}
