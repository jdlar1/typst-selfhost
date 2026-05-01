# Milestone 4: Hardening and Release

## Goal

Prepare the project for real self-hosted use by improving reliability, documentation, upgrade safety, container behavior, observability, and release process.

This milestone turns the working product into something other people can install and maintain.

## User Outcome

A self-hoster can:

- install the app from documented steps
- upgrade safely
- back up and restore data
- inspect logs and health
- understand required environment variables
- recover from common failures
- trust the license and dependency posture

## Deployment Hardening

Docker Compose should include:

- clear service names
- persistent volumes
- health checks where possible
- restart policies
- environment variable examples
- resource limit guidance
- development and production guidance

The default install should not require Caddy. Optional proxy examples can be added later for:

- Caddy
- Traefik
- nginx
- Cloudflare Tunnel
- Tailscale
- Coolify

These should be examples, not mandatory architecture.

## Backup And Restore

Document backup for:

- Convex self-hosted data
- RustFS object data
- application environment file
- any generated secrets

Document restore flow:

- stop services
- restore Convex data
- restore RustFS data
- restore environment
- start services
- run health check
- verify project list and a rendered artifact

## Upgrade Strategy

Define:

- semantic versioning policy
- migration policy for Convex schema changes
- object key compatibility policy
- minimum supported previous version for upgrades
- rollback expectations

Avoid backward-compatibility layers until there is persisted data from a released version. After first public release, migrations must be treated carefully.

## Observability

Add or document:

- structured logs for worker
- render job diagnostics
- app startup checks
- storage connectivity checks
- Convex connectivity checks
- health endpoint or health route if appropriate
- clear error messages for missing env vars

## Security

Minimum security review areas:

- signed RustFS URL expiration
- object key authorization
- workspace/project access checks
- render job ownership checks
- worker cannot claim unauthorized jobs
- user-provided Typst input is rendered in constrained worker environment
- temporary files are cleaned up
- secrets are not logged

## License And Dependency Review

Project code should remain Apache-2.0.

Before release:

- add LICENSE
- set package metadata license to Apache-2.0
- add Docker image license labels
- scan dependency licenses from lockfile
- document Convex FSL Apache 2.0 dependency/service posture
- document RustFS Apache-2.0 posture

License policy:

- allowed: Apache-2.0, MIT, BSD, ISC, MPL-2.0
- review: FSL, BSL, GPL, LGPL, AGPL, custom
- block without approval: unknown, no-license, noncommercial-only

## CI Requirements

CI should run:

- install dependencies
- Biome check
- TypeScript check
- Convex typecheck
- unit tests
- Effect tests
- production build
- Docker image build
- Compose smoke test
- Playwright smoke test
- license check

## Documentation Requirements

Docs should include:

- quick start
- environment variables
- architecture overview
- backup/restore
- upgrade guide
- troubleshooting
- dark mode/design notes after milestone 3
- collaboration notes after milestone 2
- license/dependency notes

## Acceptance Criteria

- A clean machine can install the app from the documented steps.
- CI validates the same flow users are expected to run.
- Backup and restore instructions have been tested at least once.
- Common failures have troubleshooting notes.
- Dependency license posture is documented.
- Images are ready to publish or already published.

## Non-Goals

- Managed hosted SaaS operations
- Enterprise SSO
- Multi-region deployment
- Advanced observability stack
- Billing
