# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An opinionated task manager built on the PARA method (Tiago Forte). It reads
tasks from a user's Notion workspace (Projects → Tasks, grouped by a Notion
`status` property) and displays them. Notion is the source of truth; this app is
a read/organize layer over the Notion API.

## Commands

Run from the repo root unless noted. The repo is an npm-workspaces monorepo
driven by Turborepo.

```bash
npm install
npm run dev          # turbo: starts server (:8787) and client (:5173) together
npm run lint         # biome lint across all workspaces
```

Per-workspace:

```bash
# packages/notion-todo-server (Cloudflare Worker)
npm run dev          # wrangler dev
npm run deploy       # wrangler deploy --minify
npm run cf-typegen   # regenerate worker-configuration.d.ts from wrangler.jsonc

# apps/notion-todo-client (Vite + React)
npm run build        # tsc -b && vite build
npm run deploy       # wrangler deploy (publishes built assets)
```

There is no test runner configured yet (`nt-types` has a placeholder `test`
script that exits 1). Formatting/linting is Biome, not ESLint+Prettier
(the client still lists ESLint deps but Biome is the configured tool — 2-space
indent, double quotes, organize-imports on save). Regenerate Worker types with
`cf-typegen` after editing `wrangler.jsonc`; never hand-edit
`worker-configuration.d.ts` or `*.gen.ts` (both are Biome-ignored).

## Architecture

Three workspaces:

- **`packages/notion-todo-server`** — Hono app on Cloudflare Workers. Proxies the
  Notion API and (in progress) handles Notion OAuth + sessions.
- **`apps/notion-todo-client`** — React 19 SPA: Vite + TanStack Router
  (file-based routes) + TanStack Query + Tailwind v4, deployed as a Cloudflare
  Worker serving SPA assets.
- **`packages/nt-types`** (`nt-types`) — shared TypeScript types imported by both
  sides. **This is the API contract.** Server responses and client fetch calls
  must agree through these types. It re-exports `@notionhq/client` types and
  defines the app's own `ApiResponse` envelope.

### The API response envelope

Every server endpoint returns a discriminated union from `nt-types`:

```ts
ApiResponse<T> = { success: true; data: T } | { success: false; error: {...} }
```

Server routes build these via the `createErrorResponse` / `handleNotionApiError`
helpers in `routes/databases.ts` (maps Notion HTTP status → typed `ApiErrorCode`).
Client hooks (e.g. `hooks/useGetDataSources.ts`) check `result.success` and throw
on the error branch so TanStack Query surfaces it. Keep both sides in sync when
changing a payload shape.

### Notion specifics

- Notion API version is pinned to `2025-09-03` and the app queries **data
  sources** (`filter: object=data_source`), the current Notion model, not the
  legacy `database` object. `NotionDatabaseResponse` / `DataSourceSearchResponse`
  in `nt-types` narrow the SDK's loose `results` arrays to concrete object types.
- Task grouping (`features/TodoList.tsx`) keys off a Notion `status` property: it
  finds the property of type `status` on each page, then maps each status option
  into its status **group** (`Not started` / `Next action` / `In progress` /
  `Done`). `StatusDatabasePropertyConfigResponse` describes that group structure.

### Auth (work in progress on `feat/setup-notion-public-integration`)

The app is moving from a single `NOTION_TOKEN` env var to per-user Notion OAuth:

- `routes/oauth.ts` — OAuth callback: exchanges code for token
  (`lib/notion.ts`), creates a session, sets an httpOnly `session_id` cookie.
- `lib/session.ts` — sessions stored in Workers KV (`USER_SESSION` binding),
  keyed `session:<uuid>`, 90-day TTL.
- `lib/cookies.ts` — `session_id` cookie helpers (httpOnly, secure, sameSite=lax).
- `routes/auth.ts` — `/logout` deletes the session and clears the cookie.

Note: `oauth`/`auth` routes are now mounted under `/api` in `src/index.ts`
(`/api/oauth`, `/api/auth`), but `routes/databases.ts` still uses the static
`NOTION_TOKEN` rather than the session's access token — that swap, plus
`requireSession()` gating, is tracked in issue #61.

### Config & secrets

- Server env/bindings are typed in `src/types/index.ts` as `HonoBindings`
  (`NOTION_TOKEN`, `NOTION_OAUTH_*`, `USER_SESSION` KV, etc.). Instantiate Hono as
  `new Hono<{ Bindings: HonoBindings }>()`.
- Local server secrets live in `packages/notion-todo-server/.dev.vars` (gitignored).
- Single-origin topology (`notiontaskmanager.app`): the client calls the API with
  relative `/api/...` paths — there is no `VITE_API_URL` env var anymore. Locally,
  Vite's dev server proxies `/api` → `http://localhost:8787` (`vite.config.ts`) so
  cookie behavior matches production; in production the same origin serves both
  via Cloudflare Worker Routes (`/api/*` → server, `/*` → client). See
  `docs/adr/0001-single-origin-via-path-split-worker-routes.md`.

## Agent skills

### Issue tracker

Issues live as GitHub issues in `kbberker/notion-todo` (via the `gh` CLI). See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical five-role vocabulary, default strings (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: root `docs/adr/`, no `CONTEXT.md` yet. See `docs/agents/domain.md`.
