# Reactive, 401-driven Notion token refresh

Notion's OAuth token response publishes no expiry (`expires_in`), so we cannot
refresh proactively on a timestamp — any stored `accessTokenExpiresAt` would be a
fabricated guess. Instead, a single `notionFetch` helper refreshes reactively: on
a 401 from the Notion API it calls the refresh endpoint, persists the rotated
access **and** refresh tokens to KV (Notion rotates the refresh token on every
refresh), and retries the call once. A `invalid_grant` response means the session
is unrecoverable (revoked or expired) → the route surfaces `SESSION_EXPIRED` and
the user must re-authenticate.

## Consequences

- `accessTokenExpiresAt` is stored as `undefined`; expiry is detected from 401s,
  not timestamps.
- All authenticated Notion calls must route through `notionFetch` so the rotated
  refresh token is always persisted — a route that calls Notion directly would
  leak a stale refresh token and silently kill the session.
- **Concurrent-refresh race accepted for MVP.** Parallel requests can both 401
  with the same refresh token; the first refresh invalidates it, so the second
  gets `invalid_grant` and spuriously reports `SESSION_EXPIRED`. We accept this
  rather than introduce a Durable Object lock; the client retries once on
  `SESSION_EXPIRED` (after a previously successful load) to absorb it. Revisit
  with a Durable Object only if it proves to bite in practice.
