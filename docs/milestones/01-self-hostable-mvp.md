# Milestone 1: Self-Hostable MVP

## Goal

Deliver a single-user or small-team self-hostable Typst web app that can be started with Docker Compose, stores projects durably, previews documents locally in the browser, and renders authoritative PDF artifacts through a server-side Typst worker. SVG rendering is supported opportunistically if it does not slow the core loop.

This milestone should prove the core product loop without adding collaboration, a complex admin console, or multiple competing backend systems.

Implementation decisions for this milestone are captured in [M1 Self-Hostable MVP Decisions](../decisions/m1-self-hostable-mvp-decisions.md).

## User Outcome

A user can:

- Start the stack with Docker Compose.
- Open the app in a browser.
- Complete first-run setup with an `INITIAL_SETUP_TOKEN`.
- Create the first superuser.
- Invite additional users with invitation links if needed.
- Create a workspace and project.
- Edit a Typst project file tree in CodeMirror.
- See fast local preview through typst.ts.
- See realtime single-user autosave status.
- Request a server-side render.
- Download the rendered PDF.
- Use the app comfortably in dark mode.

## Required Services

```txt
web
  TanStack Start on Node 24

convex
  application backend and realtime database

rustfs
  S3-compatible object storage

worker
  Typst CLI render worker
```

No Caddy, Hono, Directus, Dexie, custom Postgres schema, or pg-boss should be required for this milestone.

## Frontend Scope

Use TanStack Start with React and TanStack Router.

Required screens:

- Home or landing route for local installs
- First-run setup route
- Invite acceptance route
- Workspace/project list
- Project editor
- Render status/download panel
- Basic settings route if needed for self-host configuration visibility
- Minimal superuser admin route

Editor features:

- CodeMirror 6 editing
- project file tree with files and folders
- configurable Typst entrypoint, defaulting to `main.typ`
- syntax highlighting if available without large complexity
- realtime single-user autosave with saved/saving/unsaved/error state
- render-triggered snapshot action using the latest project state
- local typst.ts preview pane
- basic Typst error display

Collaboration is not part of this milestone. Realtime here means single-user autosave and local preview, not multi-user CRDT editing.

Admin features:

- first-run setup status
- superuser-only access control
- user list
- invitation link creation and revocation
- invite status display
- basic service/configuration visibility

Dark mode requirements:

- Dark mode must be supported from the beginning.
- The editor and preview layout must be usable in dark mode.
- Implementation may be visually plain until the design milestone.
- Do not over-invest in final aesthetics in this milestone.

## Convex Scope

Initial Convex schema:

- Convex Auth tables
- users
- invites
- workspaces
- workspaceMembers
- projects
- projectFiles
- projectSnapshots
- renderJobs
- renderArtifacts
- activityEvents
- settings

Initial functions:

- first-run setup and superuser creation
- invite creation, revocation, and acceptance
- create workspace/project
- create/rename/delete project files and folders
- list projects
- get project
- save project snapshot metadata
- create signed RustFS upload/download URLs
- enqueue render job
- claim render job
- update render job status
- list render artifacts
- write basic activity events

Use Convex Auth. Fresh installs start in setup mode until a superuser is created with `INITIAL_SETUP_TOKEN`. After setup, public signup is disabled by default and additional users join through invitation links. Authorization can be simple but must exist. Avoid designing a complex role system before the product loop is working.

## RustFS Scope

RustFS stores:

- project snapshots
- project assets used by MVP projects
- rendered PDFs
- rendered SVGs if supported in MVP

Minimum bucket/object behavior:

- predictable bucket name from environment
- bucket initialization during startup or documented first boot
- signed upload/download path through Convex functions
- object key builders tested as pure logic

## Worker Scope

The worker should be a separate container because Typst CLI execution is process-heavy and failure-prone compared to normal web requests.

Worker flow:

```txt
read config
connect to Convex
claim queued render job
download source snapshot from RustFS
stage project files in temp directory
run Typst CLI
upload PDF/SVG to RustFS
update Convex job status
record diagnostics on failure
```

Use Effect for:

- configuration
- logging
- RustFS access
- Convex job access
- Typst CLI execution
- retries/timeouts
- test layers

## Tooling Scope

Required tooling:

- Node 24
- pnpm
- TypeScript
- Biome
- Vitest
- @effect/vitest
- Playwright
- Docker Compose

Expected scripts:

```json
{
  "dev": "...",
  "build": "...",
  "start": "...",
  "check": "biome check .",
  "format": "biome format --write .",
  "typecheck": "tsc --noEmit",
  "test": "vitest",
  "test:e2e": "playwright test",
  "convex:typecheck": "convex typecheck"
}
```

Exact scripts can change during implementation, but the docs and AGENTS.md should reflect the executable reality.

## Testing Requirements

Static checks:

- Biome check passes.
- TypeScript check passes.
- Convex typecheck passes.
- Production build passes.

Unit tests:

- object key generation
- render job state transitions
- Typst diagnostics parsing
- project/file validation

Effect tests:

- worker succeeds with fake Convex, fake RustFS, fake Typst CLI
- worker records failure diagnostics when Typst fails
- worker handles upload failure correctly
- worker handles timeout/retry behavior with TestClock

Integration tests:

- real RustFS upload/download
- enqueue and complete a render job through the worker

Playwright smoke test:

- stack boots
- app opens
- first-run setup creates a superuser with `INITIAL_SETUP_TOKEN`
- public signup is closed after setup
- an invitation link can create another user if enabled in the test path
- project can be created
- files and folders can be created in a project
- Typst entrypoint can be edited
- autosave status is visible
- local preview appears or reports diagnostics
- render job completes
- PDF can be downloaded
- dark mode is available and usable

## Acceptance Criteria

- `docker compose up -d` starts the MVP stack from a fresh checkout and `.env` file.
- First-run setup requires `INITIAL_SETUP_TOKEN`, creates a superuser, and disables public signup by default.
- The superuser can create invitation links for additional users.
- A new authorized user can create and render a Typst project without manual database/storage setup.
- Projects support a file tree with a Typst entrypoint rather than only one hard-coded document.
- Project edits autosave and server render snapshots the latest project state before enqueueing work.
- Render failures are visible to the user and recorded in Convex.
- RustFS contains rendered artifacts after successful server render.
- No removed core services are required: Caddy, Hono, Directus, Dexie, pg-boss.
- Dark mode is present and usable, even if final visual design is deferred.

## Non-Goals

- Real-time collaborative editing
- Full design system polish
- Public API
- Mobile app
- Advanced admin console
- Multi-node RustFS deployment
- Complex billing or hosted SaaS features
