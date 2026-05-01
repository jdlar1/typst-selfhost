# Agent Notes

This repo is a pnpm TypeScript monorepo for a self-hostable Typst web app. Use these notes as the practical source of truth for working in this codebase.

## Runtime And Package Manager

- Use Node 24.
- Use pnpm. The root `package.json` declares `pnpm@9.15.4`.
- Prefer `corepack enable` if pnpm is missing.
- Do not switch package managers.
- Do not add npm, yarn, or bun lockfiles.

## Current Implementation State

The repo is a buildable Milestone 1 foundation, not a complete product yet.

Implemented:

- TanStack Start app shell in `app/`.
- Convex schema/functions in `convex/`.
- Convex Auth password configuration in `convex/auth.ts`.
- M1 setup-token bootstrap mutation in `convex/setup.ts`.
- Invite functions in `convex/invites.ts`.
- Project/file/render functions in `convex/projects.ts` and `convex/renders.ts`.
- Convex Node actions for RustFS signed URLs in `convex/storage.ts`.
- Shared pure domain package in `packages/domain/`.
- Effect worker orchestration skeleton in `worker/`.
- Docker Compose for `web`, `convex`, `rustfs`, and `worker`.

Not yet complete:

- App forms are not wired to Convex Auth/functions.
- CodeMirror is not integrated yet.
- typst.ts local preview is not integrated yet.
- Autosave is not connected to durable state yet.
- Worker live adapters for Convex, RustFS, and Typst CLI are placeholders.
- Render/download is not end-to-end yet.

Do not claim the product loop works until these are wired and verified.

## Source Of Truth Docs

- Master architecture: `docs/masterplan.md`.
- M1 scope: `docs/milestones/01-self-hostable-mvp.md`.
- M1 locked decisions: `docs/decisions/m1-self-hostable-mvp-decisions.md`.
- README for user/operator commands: `README.md`.

If implementation changes invalidate those docs, update the docs in the same change.

## Required M1 Architecture Decisions

Preserve these unless the user explicitly changes them:

- Use Convex Auth.
- Fresh install requires `INITIAL_SETUP_TOKEN` to create the first superuser.
- Public signup is disabled by default after setup.
- Additional users join through invitation links.
- Include a minimal superuser admin area.
- Convex owns RustFS signed upload/download URL generation.
- Worker polls/claims queued render jobs from Convex.
- PDF rendering is required; SVG is opportunistic.
- RustFS console is development-profile-only.
- M1 supports a project file tree, not only one `main.typ` file.
- Realtime in M1 means single-user autosave/local preview, not collaboration.
- Collaboration is Milestone 2 with Yjs/Y-Sweet.
- Default required services are only `web`, `convex`, `rustfs`, and `worker`.
- Do not add Caddy, Hono, Directus, Dexie, custom Postgres app schema, or pg-boss as required M1 services.

## Commands

Root scripts from `package.json` are the source of truth:

- `pnpm dev`: starts the TanStack Start app.
- `pnpm build`: builds workspace packages.
- `pnpm start`: starts the built TanStack Start app.
- `pnpm check`: runs Biome.
- `pnpm format`: formats with Biome.
- `pnpm typecheck`: runs TypeScript project references.
- `pnpm test`: runs Vitest.
- `pnpm test:e2e`: runs Playwright.
- `pnpm convex:typecheck`: runs Convex typecheck.

Useful verification set:

```bash
pnpm check
pnpm typecheck
pnpm test
pnpm build
pnpm convex:typecheck
```

Validate Compose without creating `.env`:

```bash
ENV_FILE=.env.example docker compose --env-file .env.example config
```

Default self-host path:

```bash
cp .env.example .env
docker compose up -d
```

Before exposing the app, change `INITIAL_SETUP_TOKEN` in `.env`.

## Code Organization

- `app/`: TanStack Start app, routes, styles, browser-facing shell.
- `app/src/components/ui/`: local shadcn/ui-style components.
- `convex/`: Convex Auth, schema, queries, mutations, actions.
- `worker/`: Effect worker package and tests.
- `packages/domain/`: pure shared logic and validation.
- `tests/e2e/`: Playwright tests.
- `docs/`: planning and decision documents.
- `.github/workflows/`: CI and Docker publishing workflows.

When adding shared business logic, prefer `packages/domain` if it can be tested without services.

When adding worker side effects, keep them behind Effect services so fake layers can test success/failure paths.

When adding UI, use Tailwind v4 utilities and local shadcn/ui-style components. Keep M1 dark-mode usable and app-first. Do not add a marketing landing page before the editor loop works.

## Convex Notes

- `convex/storage.ts` uses `"use node"` because AWS S3 signing requires Node-compatible APIs.
- `convex/_generated/server.ts` is currently a minimal local stub so `pnpm convex:typecheck` can run before a real Convex deployment is configured.
- Running `convex dev` or `convex codegen` may replace generated files.
- If generated Convex files change, do not hand-edit them unless they are still local stubs and the repo has no configured deployment.
- Authorization must exist on workspace/project/render/storage paths. Do not add unauthenticated shortcuts for convenience.

## Docker Notes

- `docker-compose.yml` uses `${ENV_FILE:-.env}` for service env files.
- Use `ENV_FILE=.env.example docker compose --env-file .env.example config` for config validation without local secrets.
- The default Compose stack must remain small: `web`, `convex`, `rustfs`, `worker`.
- `rustfs-console` is behind the `dev` profile.
- Do not expose RustFS console by default.
- Docker images publish to GHCR from `.github/workflows/docker-publish.yml` only for `v*` tags.
- Do not add `latest` image publishing until the product loop is complete enough for ordinary self-host use.

## Versioning Notes

- Use SemVer-style tags such as `v0.1.0`.
- Keep `package.json` version aligned with release tags.
- Update `CHANGELOG.md` before release tags.
- Versioning and publishing policy lives in `docs/release/versioning-and-publishing.md`.

## Testing Guidance

- Add unit tests for pure object keys, render state transitions, project validation, and diagnostics parsing.
- Add Effect tests for worker success, Typst failure, upload failure, and timeout/retry behavior.
- Add Convex tests or typechecked functions around setup, invites, authorization, projects, files, snapshots, and renders.
- Add Playwright tests only when the browser flow is wired enough to be meaningful.

## Editing Rules For This Repo

- Keep changes minimal and directly tied to the task.
- Preserve strict TypeScript.
- Preserve Biome formatting and import organization.
- Prefer project references and workspace packages over ad hoc relative imports across package boundaries.
- Do not introduce backward-compatibility layers unless there is released persisted data or an explicit user requirement.
- Do not mark M1 acceptance criteria complete until Docker Compose, auth setup, file tree editing, autosave, typst.ts preview, server render, artifact download, and dark mode are verified end-to-end.
