import { refreshRoute } from "@/lib/router";
import type { GitHubSession, OAuthSettings } from "@/types";

/**
 * GitHub OAuth for a front-end-only store.
 *
 * GitHub's OAuth token endpoint requires the app's client secret and does not
 * allow browser CORS requests, so the authorization `code` is exchanged by the
 * small relay in `api/github-oauth.ts` (deployed next to the site). The client
 * secret never reaches the browser and no token is stored in localStorage.
 *
 * Flow: authorize → GitHub redirects ?code&state → relay exchanges code →
 * token kept in sessionStorage only.
 */

const SESSION_KEY = "malika.github.session";
const STATE_KEY = "malika.github.oauth.state";
const CONFIG_KEY = "malika.github.oauth.config";

export const defaultOAuthSettings: OAuthSettings = {
  clientId: "",
  relayUrl: "/api/github-oauth",
  scope: "public_repo",
};

export function getRedirectUri(): string {
  return `${window.location.origin}${window.location.pathname}`;
}

export function loadOAuthSettings(): OAuthSettings {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return defaultOAuthSettings;
    return { ...defaultOAuthSettings, ...(JSON.parse(raw) as Partial<OAuthSettings>) };
  } catch {
    return defaultOAuthSettings;
  }
}

export function saveOAuthSettings(settings: OAuthSettings) {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(settings));
  } catch {
    // ignore blocked storage
  }
}

function readStored(store: Storage): GitHubSession | null {
  try {
    const raw = store.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GitHubSession;
    return parsed?.token ? parsed : null;
  } catch {
    return null;
  }
}

/** This tab's session first, then a token the owner chose to keep on this device. */
export function loadSession(): GitHubSession | null {
  return readStored(sessionStorage) ?? readStored(localStorage);
}

/** True when the current token is kept on this device rather than for this tab only. */
export function isRemembered(): boolean {
  return readStored(sessionStorage) === null && readStored(localStorage) !== null;
}

/**
 * `remember: false` (default) keeps the token in sessionStorage — gone when the
 * tab closes. `remember: true` keeps it in localStorage so publishing stays
 * one click across visits. It is never stored in both places.
 */
export function saveSession(session: GitHubSession, remember = false) {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
    (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // storage blocked — the session simply will not persist
  }
}

export function clearSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export function hasOAuthCallback(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.has("code") || params.has("error") || params.has("state");
}

export function startOAuth(settings: OAuthSettings) {
  if (!settings.clientId.trim() || !settings.relayUrl.trim()) {
    throw new Error("Missing GitHub OAuth Client ID or relay URL.");
  }
  const state =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  sessionStorage.setItem(STATE_KEY, JSON.stringify({ state, createdAt: Date.now() }));

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", settings.clientId.trim());
  url.searchParams.set("redirect_uri", getRedirectUri());
  url.searchParams.set("scope", settings.scope);
  url.searchParams.set("state", state);
  url.searchParams.set("allow_signup", "false");
  window.location.assign(url.toString());
}

/** Fetch the connected account so the studio can show who is signed in. */
export async function fetchProfile(token: string): Promise<{ login: string; name?: string; avatar?: string }> {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error("Invalid or expired GitHub token.");
    throw new Error(`Could not load GitHub profile (${response.status}).`);
  }
  const data = await response.json();
  return { login: data.login, name: data.name ?? undefined, avatar: data.avatar_url ?? undefined };
}

function cleanCallbackUrl() {
  const target = `${window.location.pathname}${window.location.hash || "#/studio"}`;
  window.history.replaceState({}, document.title, target);
  refreshRoute();
}

/** Verify a personal access token and store the session (manual fallback). */
export async function connectWithToken(token: string): Promise<GitHubSession> {
  const cleaned = token.trim();
  if (!cleaned) throw new Error("Add a token first.");
  const profile = await fetchProfile(cleaned);
  const session: GitHubSession = {
    token: cleaned,
    login: profile.login,
    name: profile.name,
    avatar: profile.avatar,
    method: "token",
    connectedAt: new Date().toISOString(),
  };
  saveSession(session);
  return session;
}

/**
 * Complete the OAuth redirect: validate `state`, ask the relay to exchange the
 * code, verify the account, then remove the query string from the URL.
 */
export async function completeOAuthCallback(): Promise<GitHubSession | null> {
  if (!hasOAuthCallback()) return null;
  const params = new URLSearchParams(window.location.search);
  const error = params.get("error");
  const errorDescription = params.get("error_description");
  const code = params.get("code");
  const state = params.get("state");

  if (error) {
    cleanCallbackUrl();
    throw new Error(errorDescription || error);
  }
  if (!code) {
    cleanCallbackUrl();
    return null;
  }

  let saved: { state: string; createdAt: number } | null = null;
  try {
    const raw = sessionStorage.getItem(STATE_KEY);
    saved = raw ? (JSON.parse(raw) as { state: string; createdAt: number }) : null;
  } catch {
    saved = null;
  }

  if (!saved || saved.state !== state || Date.now() - saved.createdAt > 10 * 60 * 1000) {
    cleanCallbackUrl();
    throw new Error("The GitHub sign-in request expired or was tampered with. Please try again.");
  }

  const settings = loadOAuthSettings();
  if (!settings.relayUrl.trim()) {
    cleanCallbackUrl();
    throw new Error("Add the token-exchange relay URL before connecting GitHub.");
  }

  try {
    const response = await fetch(settings.relayUrl.trim(), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ code, redirectUri: getRedirectUri() }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.access_token) {
      throw new Error(data?.error_description || data?.error || `Token exchange failed (${response.status}).`);
    }

    const profile = await fetchProfile(data.access_token as string);
    const session: GitHubSession = {
      token: data.access_token as string,
      login: profile.login,
      name: profile.name,
      avatar: profile.avatar,
      method: "oauth",
      scopes: typeof data.scope === "string" ? data.scope : settings.scope,
      connectedAt: new Date().toISOString(),
    };
    saveSession(session);
    sessionStorage.removeItem(STATE_KEY);
    return session;
  } finally {
    cleanCallbackUrl();
  }
}
