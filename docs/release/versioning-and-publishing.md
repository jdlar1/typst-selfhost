# Versioning And Publishing

This project uses SemVer-style releases and GitHub Container Registry images.

## Versioning Policy

- Use `0.x.y` while the product loop is still maturing.
- Use `1.0.0` only after the self-host flow is reliable end-to-end.
- Keep root `package.json` `version` aligned with release tags.
- Release tags use the format `v0.1.0`, `v0.2.0`, and so on.
- Update `CHANGELOG.md` before creating a release tag.

Pre-1.0 compatibility policy:

- Breaking changes are allowed, but document them in `CHANGELOG.md`.
- After the first public image that users may run with real data, treat Convex schema and RustFS object key changes carefully.
- Avoid migration/backward-compatibility layers until there is released persisted data.

## Docker Images

Images publish to GitHub Container Registry:

```txt
ghcr.io/<owner>/<repo>-web
ghcr.io/<owner>/<repo>-worker
```

Tags:

- `vX.Y.Z`: published from matching Git tags.
- `X.Y.Z`, `X.Y`, and `X`: published from matching Git tags by metadata extraction.
- `latest`: intentionally not published yet.

Images are not published from ordinary `main` pushes. CI still builds images on `main` and pull requests to verify Dockerfiles. Do not publish `latest` until the product loop is complete enough for normal self-host use.

## Release Checklist

1. Confirm the working tree is clean.
2. Run `pnpm check`.
3. Run `pnpm typecheck`.
4. Run `pnpm test`.
5. Run `pnpm build`.
6. Run `pnpm convex:typecheck`.
7. Run `ENV_FILE=.env.example docker compose --env-file .env.example config`.
8. Update `CHANGELOG.md`.
9. Update `package.json` version.
10. Commit the release prep.
11. Create and push a tag like `v0.1.0`.

Example:

```bash
git tag v0.1.0
git push origin v0.1.0
```

The Docker publish workflow builds and pushes `web` and `worker` images automatically for release tags.
