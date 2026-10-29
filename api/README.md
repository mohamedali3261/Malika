# GitHub OAuth relay

`api/github-oauth.ts` is the only server-side piece of the studio. It exchanges the
GitHub OAuth `code` for an access token so the client secret never touches the browser.

## 1. Create the OAuth App

GitHub → Settings → Developer settings → OAuth Apps → **New OAuth App**

| Field | Value |
| --- | --- |
| Application name | SHADHA Studio |
| Homepage URL | `https://your-store.example` |
| Authorization callback URL | `https://your-store.example/` |

The callback must be **the site root** (no `#` hash). Copy the **Client ID**; the client
secret stays on the server.

> If you host at `https://example.com/store/`, include the trailing slash: `https://example.com/store/`.

## 2. Deploy the relay

**Vercel** — the file is picked up automatically at `/api/github-oauth`. Add environment
variables in Project → Settings → Environment Variables:

```
GITHUB_CLIENT_ID=Ov23li...
GITHUB_CLIENT_SECRET=********
ALLOWED_ORIGIN=https://your-store.example
```

**Netlify** — move the handler to `netlify/functions/github-oauth.ts` (or keep the `api`
folder and add a redirect to `/.netlify/functions/github-oauth`), then set the same
variables in Site settings → Environment variables.

## 3. Connect from the studio

1. Open `#/studio` → **GitHub publish**.
2. Paste the Client ID. Keep the relay URL as `/api/github-oauth` when the function is on
   the same domain (or paste the full URL).
3. Choose `public_repo` for a public repository, `repo` for a private one.
4. Press **Connect GitHub**, approve the app. GitHub returns to the site, the relay
   exchanges the code, and the studio shows `@your-login`.

The token is kept in `sessionStorage` only, and is cleared when the tab closes. Press
**Disconnect** at any time.

## Security

- Never commit `.env` or the client secret.
- The client secret is used only inside this handler.
- Keep the scope as small as possible; `public_repo` is enough for a public store repo.
- For a multi-user production studio, also verify a signed-in staff session and restrict
  `ALLOWED_ORIGIN` — the token exchange alone does not authorise who may administer the store.
