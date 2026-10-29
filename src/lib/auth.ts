/**
 * Studio access gate.
 *
 * The passcode is NEVER stored anywhere. Only a PBKDF2-HMAC-SHA256 digest
 * (310,000 iterations — the OWASP recommendation) of `username\u001Fpassword`
 * is embedded, together with a public salt. Verification re-derives the digest
 * in the browser with WebCrypto and compares it in constant time.
 *
 * Honest threat model
 * -------------------
 * This is a static, front-end-only site: everything shipped to the browser can
 * be read. The digest cannot be reversed, so the passcode itself stays secret,
 * but a determined developer can still read the bundle and skip the UI check.
 * That is why the *dangerous* capability — publishing to GitHub — is protected
 * by real GitHub OAuth (verified server-side by GitHub itself), not by this
 * gate. For a hard lock on the studio UI, put the deployment behind Cloudflare
 * Access / Netlify Identity / Vercel password protection (see README).
 */

const SALT_HEX = "6f33dbab4bdb94e478f32e9852969fb0";
const ITERATIONS = 310_000;
const DIGEST_HEX = "ecba45db35a93a7c3880326f9af775b3973a34caa137ffad8c6f4dc53c9c9129";

const SESSION_KEY = "malika.studio.session";
const LOCK_KEY = "malika.studio.lock";

/** Session lifetime and idle timeout. */
const SESSION_MS = 8 * 60 * 60 * 1000;
const IDLE_MS = 30 * 60 * 1000;

/** Brute-force throttling. */
const FREE_ATTEMPTS = 3;
const BASE_DELAY_MS = 5_000;
const MAX_DELAY_MS = 15 * 60 * 1000;

interface LockState {
  fails: number;
  until: number;
}

interface SessionState {
  token: string;
  exp: number;
  seen: number;
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function bytesToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** Comparison whose duration does not depend on where the first difference is. */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function derive(username: string, password: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) throw new Error("Secure context required (https).");

  const material = `${username.toLowerCase().trim()}\u001F${password}`;
  const key = await subtle.importKey("raw", new TextEncoder().encode(material), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await subtle.deriveBits(
    { name: "PBKDF2", salt: hexToBytes(SALT_HEX) as BufferSource, iterations: ITERATIONS, hash: "SHA-256" },
    key,
    256
  );
  return bytesToHex(bits);
}

/* ------------------------------ lockout ------------------------------ */

function readLock(): LockState {
  try {
    const raw = localStorage.getItem(LOCK_KEY);
    if (!raw) return { fails: 0, until: 0 };
    const parsed = JSON.parse(raw) as LockState;
    return { fails: Number(parsed.fails) || 0, until: Number(parsed.until) || 0 };
  } catch {
    return { fails: 0, until: 0 };
  }
}

function writeLock(state: LockState) {
  try {
    localStorage.setItem(LOCK_KEY, JSON.stringify(state));
  } catch {
    /* storage blocked — throttling degrades, nothing else breaks */
  }
}

/** Milliseconds the user must still wait, 0 when unlocked. */
export function lockRemaining(): number {
  const { until } = readLock();
  return Math.max(0, until - Date.now());
}

export function failedAttempts(): number {
  return readLock().fails;
}

function registerFailure() {
  const state = readLock();
  const fails = state.fails + 1;
  const over = Math.max(0, fails - FREE_ATTEMPTS);
  const delay = over === 0 ? 0 : Math.min(BASE_DELAY_MS * 2 ** (over - 1), MAX_DELAY_MS);
  writeLock({ fails, until: delay ? Date.now() + delay : 0 });
}

function clearFailures() {
  writeLock({ fails: 0, until: 0 });
}

/* ------------------------------ session ------------------------------ */

function readSession(): SessionState | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionState;
  } catch {
    return null;
  }
}

export function isUnlocked(): boolean {
  const session = readSession();
  if (!session) return false;
  const now = Date.now();
  const valid =
    constantTimeEqual(session.token ?? "", DIGEST_HEX) &&
    now < Number(session.exp) &&
    now - Number(session.seen) < IDLE_MS;
  if (!valid) {
    lock();
    return false;
  }
  return true;
}

/** Refresh the idle timer while the admin is actively working. */
export function touchSession() {
  const session = readSession();
  if (!session) return;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, seen: Date.now() }));
  } catch {
    /* ignore */
  }
}

export function lock() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export type UnlockResult =
  | { ok: true }
  | { ok: false; reason: "locked"; waitMs: number }
  | { ok: false; reason: "invalid" }
  | { ok: false; reason: "unsupported" };

export async function unlock(username: string, password: string): Promise<UnlockResult> {
  const waitMs = lockRemaining();
  if (waitMs > 0) return { ok: false, reason: "locked", waitMs };

  let digest: string;
  try {
    digest = await derive(username, password);
  } catch {
    return { ok: false, reason: "unsupported" };
  }

  if (!constantTimeEqual(digest, DIGEST_HEX)) {
    registerFailure();
    return { ok: false, reason: "invalid" };
  }

  clearFailures();
  const now = Date.now();
  try {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ token: digest, exp: now + SESSION_MS, seen: now } satisfies SessionState)
    );
  } catch {
    /* ignore */
  }
  return { ok: true };
}

export const authPolicy = {
  iterations: ITERATIONS,
  sessionHours: SESSION_MS / 3_600_000,
  idleMinutes: IDLE_MS / 60_000,
  freeAttempts: FREE_ATTEMPTS,
};
