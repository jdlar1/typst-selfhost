# Changelog

All notable user-facing changes will be documented here.

This project follows Semantic Versioning while it is pre-1.0: breaking changes can happen in `0.x` releases, but they should still be documented clearly once users may have persisted data.

## Unreleased

- No changes yet.

## 0.2.0

- Add the app-first dark UI shell for setup, invite acceptance, admin, and project editor routes.
- Restrict GHCR image publishing to `v*` release tags; ordinary `main` pushes now only verify image builds in CI.
- Add live worker adapters for RustFS-compatible object storage and Typst CLI PDF rendering from project snapshots.

## 0.1.0

- Bootstrap Milestone 1 foundation with TanStack Start, Convex, RustFS, Effect worker, Docker Compose, and documentation.
- Not yet a complete end-to-end product loop.
