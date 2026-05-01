# Typst Self-Host

Typst Self-Host is an in-progress self-hostable Typst authoring and rendering app. The goal is a focused browser IDE for Typst projects that can be started with Docker Compose, stores project state durably, previews locally in the browser, and renders authoritative PDFs through a separate Typst worker.

The current repository is the Milestone 1 foundation. It has a buildable TypeScript monorepo, TanStack Start app shell, Convex schema/functions, RustFS storage signing actions, an Effect-based worker skeleton, Docker Compose config, and tests. The full end-to-end product loop is still being wired.

## Current Status

Implemented foundation:

- pnpm TypeScript monorepo on Node 24.
- TanStack Start app shell with dark-mode-first routes.
- Convex Auth configuration with password auth.
- First-run setup mutation requiring `INITIAL_SETUP_TOKEN`.
- Invitation link schema and Convex functions.
- Workspace, project, file tree, snapshot, render job, artifact, activity schemas.
- Convex actions for signed RustFS upload/download URLs.
- Shared domain package for object keys, project tree validation, render job states, and Typst diagnostics parsing.
- Effect worker orchestration skeleton with fake-service tests.
- Docker Compose for `web`, `convex`, `rustfs`, and `worker`.
- Development-only RustFS console profile.

Not wired end-to-end yet:

- Browser forms do not yet call Convex Auth/functions.
- CodeMirror is not installed in the editor shell yet.
- typst.ts local preview is not integrated yet.
- Realtime autosave is not connected to Convex/RustFS yet.
- Worker live adapters for Convex, RustFS, and Typst CLI are placeholders.
- Server render/download flow is not functional yet.
- Playwright coverage is only a starter smoke test.

## Product Direction

Milestone 1 targets this user flow:

- Start the stack with Docker Compose.
- Open the app in a browser.
- Complete first-run setup with `INITIAL_SETUP_TOKEN`.
- Create the first superuser.
- Invite additional users with invitation links.
- Create a workspace and Typst project.
- Edit a real project file tree.
- See fast local preview through typst.ts.
- Autosave single-user edits.
- Request a server-side render.
- Download the rendered PDF.
- Use the app comfortably in dark mode.

See the source planning docs:

- `docs/masterplan.md`
- `docs/milestones/01-self-hostable-mvp.md`
- `docs/decisions/m1-self-hostable-mvp-decisions.md`
- `docs/release/versioning-and-publishing.md`

## Stack

- App: TanStack Start, React, TanStack Router, Node 24.
- Backend: Convex and Convex Auth.
- Storage: RustFS as S3-compatible object storage.
- Worker: TypeScript, Effect, Typst CLI.
- Tooling: pnpm, TypeScript project references, Biome, Vitest, Playwright, Docker Compose.

The default Milestone 1 stack intentionally does not require Caddy, Hono, Directus, Dexie, a custom Postgres app schema, or pg-boss.

## Repository Layout

```txt
typst-selfhost/
  app/                     TanStack Start app shell
  convex/                  Convex schema, auth, functions, storage actions
  worker/                  Effect-based Typst worker package
  packages/domain/         Pure shared domain logic and tests
  docs/                    Masterplan, milestones, decisions
  tests/e2e/               Playwright tests
  docker-compose.yml       Default self-host service graph
  Dockerfile.web           Web image
  Dockerfile.worker        Worker image with Typst CLI
  package.json             Root scripts
  pnpm-workspace.yaml      Workspace packages
```

## Requirements

- Node 24.
- pnpm 9 through Corepack or a local install.
- Docker and Docker Compose for the self-host stack.

Recommended setup:

```bash
corepack enable
pnpm install
```

## Local Development

Install dependencies:

```bash
pnpm install
```

Run the app shell:

```bash
pnpm dev
```

Open:

```txt
http://localhost:3000
```

Useful routes while the app is still a shell:

```txt
http://localhost:3000/
http://localhost:3000/setup
http://localhost:3000/admin
http://localhost:3000/invite/test-token
http://localhost:3000/projects/demo
```

## Verification Commands

Run these before and after meaningful changes:

```bash
pnpm check
pnpm typecheck
pnpm test
pnpm build
pnpm convex:typecheck
```

What they do:

- `pnpm check`: Biome formatting/lint/import checks.
- `pnpm typecheck`: TypeScript project references for app, worker, and packages.
- `pnpm test`: Vitest unit and worker tests.
- `pnpm build`: production build for workspace packages.
- `pnpm convex:typecheck`: Convex function typecheck.

Validate Compose without creating `.env`:

```bash
ENV_FILE=.env.example docker compose --env-file .env.example config
```

## Docker Compose

The intended self-host path is:

```bash
cp .env.example .env
```

Before exposing the app, edit `.env` and replace:

```txt
INITIAL_SETUP_TOKEN=change-me-before-first-boot
```

with a private one-time setup token.

Then run:

```bash
docker compose up -d
```

Default services:

- `web`: TanStack Start app on port `3000`.
- `convex`: Convex backend on ports `3210` and `3211`.
- `rustfs`: S3-compatible storage on port `9000`.
- `worker`: Typst render worker.

Development-only RustFS console:

```bash
docker compose --profile dev up -d rustfs-console
```

The Compose file supports checking against `.env.example` by setting `ENV_FILE=.env.example`. Normal self-host usage should keep the default `.env` file.

## Authentication Model

Milestone 1 uses Convex Auth.

Fresh install behavior:

- App starts in setup mode.
- First superuser creation requires `INITIAL_SETUP_TOKEN` from `.env`.
- Setup completion is stored in Convex settings.
- Public signup is disabled by default after setup.
- Additional users join through invitation links.

Invitation model:

- Admin creates a copyable `/invite/{token}` link.
- Tokens are stored hashed in Convex.
- Invites can expire, be revoked, and optionally target a workspace.
- Initial roles are `superuser`, `admin`, and `member`.

## Storage Model

RustFS stores bytes. Convex stores metadata, ownership, authorization, job state, and artifact records.

Important object key patterns:

```txt
workspaces/{workspaceId}/projects/{projectId}/snapshots/{snapshotId}/tree.json
workspaces/{workspaceId}/projects/{projectId}/snapshots/{snapshotId}/files/{fileId}
workspaces/{workspaceId}/projects/{projectId}/assets/{assetId}/{filename}
workspaces/{workspaceId}/projects/{projectId}/renders/{renderId}/output.pdf
workspaces/{workspaceId}/projects/{projectId}/renders/{renderId}/output.svg
```

Convex owns signed RustFS URL generation. If Convex runtime limitations appear during live integration, revisit `docs/decisions/m1-self-hostable-mvp-decisions.md` explicitly rather than silently moving authorization elsewhere.

## Worker Model

The worker is separate because Typst CLI execution is process-heavy and failure-prone compared to normal web requests.

Target flow:

```txt
read config
claim queued render job from Convex
download source snapshot from RustFS
stage project files in temp directory
run Typst CLI
upload PDF artifact to RustFS
update Convex render job status
record diagnostics on failure
```

The current worker package implements the Effect service boundary and testable orchestration. Live adapters still need to be connected.

## Development Notes

- Prefer small changes that preserve the Milestone 1 decisions.
- Keep pure logic in `packages/domain` when it is shared by Convex, app, and worker.
- Use Effect for worker side effects and tests, not for ordinary React component state.
- Keep dark mode usable from the beginning, but do not build a full design system in M1.
- Do not add extra required services without updating the milestone decision docs.

## Versioning And Docker Publishing

The project uses SemVer-style tags such as `v0.1.0`. Pre-1.0 releases can still contain breaking changes, but those changes should be documented once users may have persisted data.

Docker images are built in CI and published to GitHub Container Registry by `.github/workflows/docker-publish.yml`:

```txt
ghcr.io/<owner>/<repo>-web
ghcr.io/<owner>/<repo>-worker
```

Publishing behavior:

- Pushes to `main` publish `edge` images.
- Tags like `v0.1.0` publish versioned images.
- `latest` is intentionally not published until the product loop is complete enough for normal self-host use.

See `docs/release/versioning-and-publishing.md` for the release checklist.

## Troubleshooting

If `pnpm convex:typecheck` complains about missing generated Convex files, the repo currently includes minimal local stubs in `convex/_generated/server.ts` so typecheck can run before a Convex deployment is configured. Running `convex dev` or `convex codegen` in a real Convex setup may replace generated files.

If Docker Compose says `.env` is missing, create it first:

```bash
cp .env.example .env
```

If you only want to validate Compose config without `.env`, run:

```bash
ENV_FILE=.env.example docker compose --env-file .env.example config
```

If app route types fail after route changes, run the app build once so TanStack Router regenerates route metadata:

```bash
pnpm --filter @typst-selfhost/app build
```
