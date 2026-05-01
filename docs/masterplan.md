# Typst Self-Host Masterplan

## Vision

Build an easy-to-self-host Typst authoring and rendering platform for individuals and teams. The product should feel like a focused browser IDE for Typst projects: fast local preview, durable project storage, server-side PDF/SVG rendering, and collaborative editing in a later milestone.

The primary deployment target is a small Docker Compose installation that someone can run on their own server without needing to assemble a separate database, API, object store, reverse proxy, queue, and admin system by hand.

The guiding installation goal is:

```bash
cp .env.example .env
docker compose up -d
```

## Product Principles

- Easy self-hosting matters more than maximum infrastructure flexibility.
- The default stack should have as few required services as practical.
- The app should be useful for a single user before collaboration exists.
- Large files and rendered artifacts belong in object storage, not the app database.
- Realtime metadata belongs in Convex; collaborative text editing belongs in Yjs/Y-Sweet.
- The first implementation should avoid duplicate sources of truth.
- Dark mode is a first-class product requirement, not a later theme toggle afterthought.
- Visual design is important, but it will be handled as a separate milestone/task.

## Final Stack Direction

### Application

- TanStack Start
- React
- TanStack Router
- TanStack Query where it is useful and not redundant with Convex
- CodeMirror 6 editor
- typst.ts browser WASM preview
- Node 24 runtime for app containers
- TypeScript

### Backend/Data

- Convex as the main backend, realtime database, and application function layer
- Convex queries, mutations, actions, and HTTP endpoints where appropriate
- No separate Hono API for the MVP
- No Directus control plane for the MVP
- No custom Postgres app schema for the MVP

### Storage

- RustFS as the default S3-compatible object store
- RustFS stores project source snapshots, assets, fonts, package cache entries, template bundles, and rendered PDFs/SVGs
- Convex stores object metadata, ownership, status, and indexes

### Rendering

- Dedicated Typst worker container
- Typst CLI for authoritative server-side renders
- Effect-based service architecture in the worker
- Effect-based tests for worker side effects and failure states

### Collaboration

- Yjs and Y-Sweet in milestone 2
- Convex handles room metadata, authorization, snapshots, and project-level state
- Y-Sweet handles CRDT sync for CodeMirror collaborative editing

### Tooling

- Node 24
- pnpm workspaces
- TypeScript strict mode
- Biome for formatting and linting
- Vitest for standard unit tests
- @effect/vitest for Effect programs
- Playwright for browser and self-host smoke tests
- Docker Compose as the primary self-host packaging format

## Intentionally Removed From The Core Plan

These technologies were discussed and intentionally removed from the MVP/core architecture.

### Caddy

Caddy is useful as optional deployment glue, but it should not be part of the core architecture. Users may already have Traefik, nginx, Caddy, Cloudflare Tunnel, Tailscale, Coolify, or another ingress setup.

The default self-host setup should work without requiring a reverse proxy. A production profile can be added later for users who want bundled TLS/proxy behavior.

### Dexie

Dexie is not part of the core plan because Convex already handles reactive application data and client synchronization patterns. Adding Dexie as another app data cache would create duplicate state and sync risks.

Possible future browser-local storage should be evaluated only for concrete needs such as heavy typst.ts cache artifacts, package cache acceleration, offline drafts, or Yjs persistence. If collaborative offline persistence is needed later, evaluate y-indexeddb, OPFS, or Dexie then.

### Hono

Hono is not needed for the MVP because TanStack Start and Convex already provide application endpoints/functions. Adding a second API framework would create two backend paths and more self-hosting surface area.

Hono can be reconsidered later only if the project needs a stable public REST API, external webhooks, CLI/mobile clients, API versioning, or a backend that must scale separately from the web app.

### Directus

Directus was removed to keep the stack closer to a Lawn-style architecture: app plus Convex plus object storage. Directus would add an additional admin/control-plane product with its own license, configuration, and data model.

Admin features should be built into the product after the core model is stable.

### Postgres App Schema and pg-boss

Convex replaces the custom application database and most queue metadata. Render jobs should be modeled in Convex. The worker can claim and update jobs through Convex functions.

## Architecture Overview

```txt
browser
  ├─ TanStack Start React app
  ├─ CodeMirror 6 editor
  ├─ typst.ts local preview
  └─ Convex client

web container
  ├─ TanStack Start server
  ├─ route loaders/actions/server functions as needed
  └─ Node 24 runtime

convex container(s)
  ├─ realtime app database
  ├─ users/workspaces/projects
  ├─ file tree metadata
  ├─ registry metadata
  ├─ render job lifecycle
  ├─ activity log
  └─ authorization logic

rustfs container
  ├─ project snapshots
  ├─ assets
  ├─ fonts
  ├─ template bundles
  ├─ package cache
  └─ rendered PDFs/SVGs

worker container
  ├─ polls or claims Convex render jobs
  ├─ downloads inputs from RustFS
  ├─ runs Typst CLI
  ├─ uploads artifacts to RustFS
  └─ updates Convex job state

ysweet container, milestone 2
  └─ collaborative CodeMirror CRDT sync
```

## Source Tree Target

The repository can remain a compact monorepo rather than a heavy multi-app workspace.

```txt
typst-selfhost/
  app/                     # TanStack Start app routes and app shell
  convex/                  # Convex schema, queries, mutations, actions
  worker/                  # Typst worker entrypoint and Effect runtime
  src/
    components/            # shared React components
    editor/                # CodeMirror and typst.ts integration
    lib/                   # shared app utilities
    server/                # server-only helpers used by TanStack Start
  packages/
    domain/                # pure schemas, state machines, object key builders
    effect-services/       # Effect service contracts and test layers
  docs/
    masterplan.md
    milestones/
  public/
  scripts/
  docker-compose.yml
  Dockerfile.web
  Dockerfile.worker
  package.json
  biome.json
  tsconfig.json
```

## Convex Data Model

Convex should own application truth for metadata and realtime state.

Initial tables:

- users
- workspaces
- workspaceMembers
- projects
- projectFiles
- projectSnapshots
- templates
- fonts
- packages
- renderJobs
- renderArtifacts
- activityEvents
- shareLinks
- settings

Convex functions should be grouped by feature:

- projects.create
- projects.list
- projects.get
- projects.archive
- files.create
- files.rename
- files.delete
- files.commitSnapshot
- storage.createUploadUrl
- storage.createDownloadUrl
- renders.enqueue
- renders.getStatus
- renders.claimNext
- renders.markRunning
- renders.markSucceeded
- renders.markFailed
- templates.list
- fonts.list
- packages.list
- activity.listForProject

## RustFS Object Layout

RustFS should store bytes only. Convex stores the metadata needed to find, authorize, and display those bytes.

Suggested object keys:

```txt
workspaces/{workspaceId}/projects/{projectId}/snapshots/{snapshotId}/main.typ
workspaces/{workspaceId}/projects/{projectId}/snapshots/{snapshotId}/files/{fileId}
workspaces/{workspaceId}/projects/{projectId}/assets/{assetId}/{filename}
workspaces/{workspaceId}/projects/{projectId}/renders/{renderId}/output.pdf
workspaces/{workspaceId}/projects/{projectId}/renders/{renderId}/output.svg
registry/fonts/{fontId}/{filename}
registry/templates/{templateId}/{version}/bundle.tar.zst
registry/packages/{packageId}/{version}/bundle.tar.zst
```

## Render Job Lifecycle

Render jobs should be explicit and inspectable.

```txt
queued -> claimed -> running -> succeeded
queued -> claimed -> running -> failed
queued -> cancelled
```

Job records should include:

- workspaceId
- projectId
- snapshotId
- requestedBy
- status
- input object keys
- output format
- artifact object keys
- diagnostics
- workerId
- timestamps
- retry count
- failure reason

## Effect Usage

Effect should be used where it improves correctness and testing of side effects. It should not be forced into every React component or simple UI interaction.

Use Effect for:

- worker orchestration
- RustFS/S3 client abstraction
- Typst CLI execution
- render job claim/update abstraction
- configuration loading
- logging
- timeout/retry behavior
- test layers and deterministic failure cases

Avoid Effect for:

- basic React component state
- ordinary route rendering
- simple form state
- CodeMirror setup unless a concrete side-effect boundary needs it

## Testing Strategy

Testing must validate both code quality and the self-host experience.

### Static Checks

- `biome check .`
- `tsc --noEmit` or project references once configured
- Convex typecheck
- production build

### Unit Tests

Use Vitest for pure logic:

- object key builders
- schema validation
- render job state machine
- permission helper logic
- Typst diagnostic parsing

### Effect Tests

Use @effect/vitest for side-effect services:

- fake RustFS success/failure layers
- fake Convex render job layers
- fake Typst CLI success/failure/timeouts
- TestClock for timeout and retry behavior
- worker job lifecycle transitions

### Convex Tests

Test Convex functions around:

- project creation
- file metadata changes
- render job enqueue/claim/update
- authorization checks
- registry reads

### Integration Tests

Run against real containers where practical:

- RustFS
- Convex self-hosted backend
- worker
- Typst CLI

Critical integration scenarios:

- upload project snapshot to RustFS
- enqueue render job in Convex
- worker claims job
- worker renders PDF/SVG
- worker uploads artifact
- Convex status updates to succeeded
- failed Typst compile records diagnostics

### Browser E2E Tests

Use Playwright against the Docker Compose stack.

MVP smoke flow:

- boot stack
- open app
- create workspace/project
- edit Typst document
- see local typst.ts preview
- request server render
- observe render status update
- download rendered PDF
- reload app and verify project persists
- verify dark mode can be enabled and remains usable

Milestone 2 collaboration flow:

- open two browser contexts
- join the same project
- edit from both contexts
- verify remote edits appear
- verify presence/cursors if implemented
- disconnect/reconnect one context
- verify edits converge

## Licensing

Project code should use Apache-2.0.

Required files and metadata:

- `LICENSE` containing Apache License 2.0
- `package.json` license field set to `Apache-2.0`
- Docker image labels with `org.opencontainers.image.licenses=Apache-2.0`

Third-party license posture:

- RustFS is Apache-2.0 based on current repository license.
- Convex self-hosted backend uses FSL Apache 2.0, which is Apache-like but not identical to Apache-2.0.
- Yjs and Y-Sweet are permissive based on current repository licenses.
- Exact dependency licenses must be scanned from lockfiles before release.

License policy:

- Allowed: Apache-2.0, MIT, BSD, ISC, MPL-2.0
- Review: FSL, BSL, GPL, LGPL, AGPL, custom licenses
- Block without explicit approval: unknown license, no license, noncommercial-only license

## Milestones

- [Editor UX Wireframes](./editor-wireframes.md)
- [Milestone 1: Self-Hostable MVP](./milestones/01-self-hostable-mvp.md)
- [Milestone 2: Collaboration](./milestones/02-collaboration.md)
- [Milestone 3: Frontend Design System](./milestones/03-frontend-design-system.md)
- [Milestone 4: Hardening and Release](./milestones/04-hardening-and-release.md)

## Open Decisions

- Whether an external auth provider should be optional after the Convex Auth self-host flow is working.
- Whether SMTP-backed invitations should be added after copyable invitation links work.
- Whether SVG rendering should become required after PDF rendering is stable.
- Whether the app should ship with optional proxy examples for Caddy, Traefik, and nginx after the core Compose flow works.

## Decided For Milestone 1

- Use Convex Auth for self-hosted authentication.
- Fresh installs require `INITIAL_SETUP_TOKEN` to create the first superuser.
- Public signup is disabled by default after setup; additional users join through invitation links.
- Include a minimal superuser admin panel in Milestone 1.
- Expose the RustFS console only through development Compose profiles or overrides.
