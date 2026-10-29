/**
 * Serverless OAuth relay — deploy next to the static site (Vercel / Netlify).
 *
 * GitHub's token endpoint needs the OAuth app's client secret and does not
 * support browser CORS, so the browser sends the one-time `code` here and this
 * function performs the exchange. The secret is read from environment
 * variables and never reaches the client.
 *
 * Required environment variables:
 *   GITHUB_CLIENT_ID
 *   GITHUB_CLIENT_SECRET
 * Optional:
 *   ALLOWED_ORIGIN   e.g. https://shadha-perfumes.vercel.app (defaults to *)
 *
 * Route: POST /api/github-oauth  { code, redirectUri } → { access_token, scope }
 */

type RelayRequest = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
};

type RelayResponse = {
  status: (code: number) => RelayResponse;
  setHeader: (name: string, value: string) => void;
  json: (payload: unknown) => void;
  end: () => void;
};

function cors(res: RelayResponse, origin: string) {
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Vary", "Origin");
}

function readBody(body: unknown): { code?: string; redirectUri?: string } {
  if (!body) return {};
  if (typeof body === "string") {
    try {
      return JSON.parse(body) as { code?: string; redirectUri?: string };
    } catch {
      return {};
    }
  }
  return body as { code?: string; redirectUri?: string };
}

export default async function handler(req: RelayRequest, res: RelayResponse) {
  const allowed = process.env.ALLOWED_ORIGIN || "*";
  cors(res, allowed);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    res.status(500).json({
      error: "relay_not_configured",
      error_description: "GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are missing on the server.",
    });
    return;
  }

  const { code, redirectUri } = readBody(req.body);
  if (!code) {
    res.status(400).json({ error: "missing_code", error_description: "The authorization code is required." });
    return;
  }

  try {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        ...(redirectUri ? { redirect_uri: redirectUri } : {}),
      }),
    });

    const data = (await response.json()) as {
      access_token?: string;
      scope?: string;
      error?: string;
      error_description?: string;
    };

    if (!response.ok || data.error || !data.access_token) {
      res.status(400).json({
        error: data.error || "exchange_failed",
        error_description: data.error_description || "GitHub rejected the authorization code.",
      });
      return;
    }

    res.status(200).json({ access_token: data.access_token, scope: data.scope || "" });
  } catch {
    res.status(502).json({ error: "github_unreachable", error_description: "Could not reach GitHub." });
  }
}
