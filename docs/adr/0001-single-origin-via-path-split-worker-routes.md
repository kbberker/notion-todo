# Single origin for app + API via path-split Worker routes

The SPA and the API are deployed as two separate Cloudflare Workers but served
from one origin (`notiontaskmanager.app`) using path-split Worker routes
(`notiontaskmanager.app/api/*` → server, `notiontaskmanager.app/*` → client;
most-specific route wins). We chose this over keeping two separate
`*.workers.dev` origins because the user session lives in an HttpOnly cookie, and
a same-origin setup lets us use `SameSite=Lax` with no CORS-credentials
configuration — a cross-origin setup would have forced `SameSite=None; Secure`,
a credentialed CORS allowlist, and `fetch(..., { credentials: "include" })`.

Tokens are never exposed to the browser; the cookie carries only an opaque
session id, and the Notion access/refresh tokens live server-side in KV.

Hard to reverse once the Notion OAuth redirect URI
(`https://notiontaskmanager.app/api/oauth/callback`) is registered against this
host — changing the host means re-coordinating the Notion integration settings.

## Considered options

- **Two `*.workers.dev` origins** — rejected: cross-site cookies are fragile and
  require `SameSite=None` + credentialed CORS.
- **Service binding (client Worker proxies `/api/*` to server Worker)** — viable,
  but requires adding a forwarding Worker entry to the assets-only client; the
  custom domain we own makes path-split routes pure config instead.
- **Collapse into one Worker** — rejected: merges the deliberately-separate
  `notion-todo-server` package and `notion-todo-client` app into one deployable.
