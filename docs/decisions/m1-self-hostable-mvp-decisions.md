# M1 Self-Hostable MVP Decisions

These decisions define the implementation shape for Milestone 1 and supersede any looser alternatives in the milestone discussion.

## Authentication And Setup

- Use Convex Auth for application authentication.
- Fresh installs start in setup mode until a superuser is created.
- Superuser creation requires `INITIAL_SETUP_TOKEN` from `.env`.
- After setup completes, public signup is disabled by default.
- Authentication remains required after setup; only open registration is disabled.
- The app should record setup completion in Convex settings.

## Superuser Admin Panel

Milestone 1 includes a minimal `/admin` area visible only to the superuser.

Required capabilities:

- Show setup status.
- List users.
- Create invitation links.
- Revoke invitation links.
- Show active, expired, revoked, and used invitations.
- Show basic service/configuration status for Convex, RustFS, and worker heartbeat if available.

Non-goals for M1:

- Complex permission matrix.
- Full audit log UI.
- SMTP setup wizard.
- Organization/team hierarchy.

## Invitation Links

Use invite links with optional email binding, not email-only invites. Self-hosters may not have SMTP configured on day one, so admins must be able to copy and share links manually.

Invite route:

```txt
/invite/{token}
```

Suggested invite record:

```txt
invites
  tokenHash
  email optional
  role
  workspaceId optional
  invitedBy
  expiresAt
  maxUses
  usedCount
  revokedAt optional
  acceptedBy optional
  acceptedAt optional
```

Initial invite behavior:

- Only the superuser can create invites.
- Invites create authenticated users through Convex Auth.
- Invites can optionally assign workspace membership.
- Public signup remains off unless explicitly enabled by the superuser.

Initial roles:

```txt
superuser
admin
member
```

Keep role checks minimal in M1. The important requirement is that authorization exists and superuser-only actions are protected.

## Rendering Artifacts

- PDF rendering is required for M1 acceptance.
- SVG rendering is opportunistic and should be shown only if generated successfully.
- The worker and artifact model may support SVG paths, but PDF is the required artifact.

## RustFS Console

- Expose the RustFS console only through a development Compose profile or override.
- Do not expose the RustFS console in the default self-host Compose path.

## Storage Signing

- Convex owns signed RustFS upload/download URL generation.
- Convex remains the authorization and metadata authority for object access.
- If a later implementation spike proves Convex cannot practically sign S3-compatible URLs in the selected self-host runtime, this decision must be revisited explicitly.

## Render Job Claiming

- The worker polls Convex and claims the next queued render job.
- Do not introduce an external queue system in M1.
- Convex stores render job state and diagnostics.

## Saving And Preview

- The editor should behave like a realtime Typst app for single-user editing.
- Local preview through typst.ts is required.
- File edits should autosave/debounce into durable project state.
- A render request always snapshots the latest editor/project state before enqueueing the render job.
- The UI should clearly show save state such as saved, saving, unsaved, and error.

This is not collaborative editing. Multi-user CRDT editing remains Milestone 2.

## Project File Tree

- M1 must support a project file tree, not only a single `main.typ` file.
- Projects have one Typst entrypoint, defaulting to `main.typ`.
- Users can create, rename, delete, and select files and folders.
- Text files are editable in CodeMirror.
- Binary assets may be uploaded and included in snapshots if needed for render support.
- Snapshots capture the project tree state used by server-side render.

## Compose Shape

- Use a base Docker Compose file plus development profiles or overrides.
- The default self-host stack includes only `web`, `convex`, `rustfs`, and `worker`.
- Development-only helpers, such as the RustFS console, must not be required for the default install path.

## UI Polish

- Use minimal semantic UI with usable dark mode.
- Do not build a full design system in M1.
- Do not make choices that block the later frontend design-system milestone.
