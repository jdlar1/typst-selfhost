# Milestone 2: Collaboration

## Goal

Add reliable collaborative editing for Typst projects using Yjs and Y-Sweet while keeping Convex as the source of truth for project metadata, authorization, snapshots, and activity.

This milestone should make multiple users editing the same document feel safe and predictable.

## User Outcome

Users can:

- Open the same Typst project from multiple browsers.
- See edits from other users in near real time.
- See basic presence or cursor information if included.
- Disconnect and reconnect without losing local changes.
- Save or checkpoint collaborative document state into durable project snapshots.

## Services

Add:

```txt
ysweet
  Yjs sync server
```

Keep:

```txt
web
convex
rustfs
worker
```

## Responsibilities

### Yjs/Y-Sweet

Yjs and Y-Sweet handle:

- CRDT text editing
- CodeMirror binding
- document update propagation
- reconnect merge behavior
- optional awareness/presence

### Convex

Convex handles:

- room metadata
- workspace/project authorization
- collaboration session authorization
- project snapshots/checkpoints
- activity events
- render jobs based on saved/checkpointed state

### RustFS

RustFS stores:

- saved snapshots
- checkpoint artifacts if needed
- rendered PDFs/SVGs from collaborative project state

## Collaboration Model

Each editable file should map to a collaboration room. Room IDs should be stable and derived from Convex metadata, not trusted from arbitrary client input.

Suggested room scope:

```txt
workspace:{workspaceId}:project:{projectId}:file:{fileId}
```

The browser should request collaboration authorization from Convex before connecting to Y-Sweet.

## Snapshot Model

Yjs is the live editing state. Convex/RustFS snapshots are the durable project state used for rendering and recovery.

Snapshot triggers may include:

- explicit save
- render request
- periodic checkpoint
- before closing if practical

The MVP of this milestone can start with explicit save and render-triggered snapshotting. Automatic checkpointing can come after correctness is proven.

## Editor Changes

CodeMirror integration should add:

- Yjs document binding
- awareness/cursors if included
- connection status
- local unsynced/reconnecting status
- conflict-safe save/checkpoint action

The UI must remain usable in dark mode.

## Testing Requirements

Unit tests:

- room ID generation
- collaboration authorization helpers
- snapshot metadata validation

Effect tests:

- collaboration token/session issuance if implemented through Effect services
- snapshot persistence service behavior
- failure behavior when Y-Sweet is unavailable

Integration tests:

- Y-Sweet connection from app
- authorized room can be joined
- unauthorized room is rejected
- snapshot writes to RustFS and Convex metadata

Playwright tests:

- two browser contexts open same project
- edit from context A appears in context B
- edit from context B appears in context A
- reconnect after network interruption preserves edits
- render uses the expected latest snapshot
- dark mode remains usable during collaboration

## Acceptance Criteria

- Multiple browser sessions can edit the same file and converge.
- Unauthorized users cannot join project rooms.
- A collaborative document can be saved to a durable project snapshot.
- Server-side render can use the saved collaborative state.
- Collaboration failures are visible and recoverable.

## Non-Goals

- Full offline-first editing guarantee
- Rich comments/review workflow
- Complex branch/version history
- Operational transform implementation
- Replacing Yjs with Convex realtime document patches
