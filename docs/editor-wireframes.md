# Editor UX Wireframes

## Purpose

This document defines the first UX sketch direction for the Typst Self-Host editor. It is intentionally wireframe-level: layout, flows, states, and interaction priorities before visual design or component implementation.

The editor should feel like a focused browser IDE for Typst projects: fast to enter, easy to understand, and near real-time while editing.

## UX Principles

- The editor is project-first, but the active document should always feel central.
- Local preview should feel instant and lightweight.
- Rendering should feel like a near real-time background capability, not a manual job queue.
- File/project state should be visible without overwhelming the writing surface.
- Dark mode should be sketched first, with rendered pages treated as light document surfaces inside a dark shell.
- The MVP should avoid collaboration UI until Yjs/Y-Sweet exists.

## Primary MVP Flow

```txt
Open app
  -> create or open workspace
  -> create or open project
  -> edit main.typ
  -> see local typst.ts preview
  -> preview updates near real-time
  -> download PDF when ready
  -> download PDF
  -> reload later and continue editing
```

## Baseline Wireframe: Classic IDE

This should be the default MVP direction.

```txt
+------------------------------------------------------------------------------+
| Top Bar                                                                      |
| Workspace / Project       Save state      Render PDF      Theme/User/Menu    |
+---------------+--------------------------------------+-----------------------+
| File Tree     | Editor                               | Preview               |
|               |                                      |                       |
| main.typ      | CodeMirror 6                         | typst.ts local        |
| sections/     |                                      | preview               |
| assets/       |                                      |                       |
| fonts/        |                                      | page canvas           |
|               |                                      | zoom controls         |
| + file        |                                      | page nav              |
+---------------+--------------------------------------+-----------------------+
| Bottom Panel: Diagnostics / Render Status / Activity                         |
+------------------------------------------------------------------------------+
```

### Layout Priorities

- Top bar owns project identity, save state, export/download actions, and account/settings access.
- Left sidebar owns project navigation and file operations.
- Center pane owns writing and inline diagnostics.
- Right pane owns visual feedback from local preview.
- Bottom panel owns deeper inspection: compile errors, render status, and activity.

### Default Pane Sizes

- File tree: 240px desktop default, resizable, collapsible.
- Editor: primary flexible pane, minimum 40% of available width.
- Preview: 40% desktop default, resizable, collapsible.
- Bottom panel: collapsed by default unless diagnostics or render status needs attention.

## Variant 1: Classic IDE

Use this for the MVP implementation baseline.

```txt
Desktop

+------------------------------------------------------------------------------+
| Project Name        Edited 12s ago              Render PDF        Settings   |
+---------------+--------------------------------------+-----------------------+
| Files         | main.typ                             | Preview               |
|               |                                      |                       |
| v project     | # Invoice                            | +-------------------+ |
|   main.typ    |                                      | |                   | |
|   logo.svg    | = Client                             | | rendered page     | |
|   fonts/      |                                      | |                   | |
|               |                                      | +-------------------+ |
| + New file    |                                      | 100%   Page 1 of 1    |
+---------------+--------------------------------------+-----------------------+
| Diagnostics: No issues                                                        |
+------------------------------------------------------------------------------+
```

Best for:

- First-time comprehension.
- Predictable desktop authoring.
- Obvious mapping to the technical architecture.

Tradeoffs:

- Can feel visually dense.
- Needs careful empty states and collapsible chrome.

## Variant 2: Writing-Focused

Use this as an alternate sketch for users who spend more time writing than managing files.

```txt
Desktop Focus Mode

+------------------------------------------------------------------------------+
| main.typ                         Preview: Off        Render PDF      Exit     |
+------------------------------------------------------------------------------+
|                                                                              |
|                                                                              |
|                         Centered CodeMirror editor                            |
|                         max width for readable editing                        |
|                                                                              |
|                                                                              |
+------------------------------------------------------------------------------+
| Inline status: Saved . Preview ready . Latest PDF updated 2m ago             |
+------------------------------------------------------------------------------+
```

Best for:

- Long-form Typst writing.
- Reducing visual noise.
- Small-screen laptop use.

Tradeoffs:

- File operations and diagnostics become less discoverable.
- Preview is one step away unless a drawer is used.

## Variant 3: Preview-Centric

Use this when sketching a workflow where the rendered document is the primary focus.

```txt
Desktop Preview Mode

+------------------------------------------------------------------------------+
| Project Name             Preview live              Export PDF      Download  |
+---------------+--------------------------+-----------------------------------+
| Files         | Editor                   | Preview                           |
|               |                          |                                   |
| main.typ      | CodeMirror               | Status: updating                  |
| assets/       |                          | Last update: now                  |
|               |                          | Source: local preview             |
|               |                          |                                   |
|               |                          | Diagnostics                       |
|               |                          | Download latest PDF               |
|               |                          | Preview settings                  |
+---------------+--------------------------+-----------------------------------+
```

Best for:

- Making the live rendered document feel central.
- Keeping export/download actions close to the preview.
- Making diagnostics visible without exposing backend internals.

Tradeoffs:

- Less useful for file-heavy projects.
- Should probably be a mode, not the only layout.

## Responsive Wireframes

### Tablet

```txt
+--------------------------------------------+
| Top Bar                                    |
+--------------------------------------------+
| Segmented Control: Editor | Preview | Files |
+--------------------------------------------+
| Active Pane                                |
|                                            |
| Editor, preview, or file tree              |
|                                            |
+--------------------------------------------+
```

Tablet should avoid cramped split panes by default. Use tabs or segmented controls, with an optional split view in landscape orientation.

### Mobile

```txt
+------------------------------+
| Project / file       Menu    |
+------------------------------+
| Editor | Preview | Files     |
+------------------------------+
| Active full-screen panel      |
|                              |
| Code, preview, or file tree   |
+------------------------------+
| Status: Saved . Preview ready |
+------------------------------+
```

Mobile is not the primary authoring environment, but it should support reading, quick edits, preview checks, and downloading rendered output.

## Core Editor States

### Empty Workspace

```txt
No projects yet

[Create project]
[Start from template]

Small note: Projects are stored in your self-hosted instance.
```

### Empty Project

```txt
Project created

[Create main.typ]
[Import files]
[Start from template]
```

### Clean Editing State

```txt
Top Bar: Saved . Preview ready . Latest PDF updated 4m ago
Bottom Panel: collapsed
```

### Dirty Editing State

```txt
Top Bar: Unsaved changes . Local preview updating
Render Button: disabled or prompts to save snapshot first
```

Recommended MVP behavior: downloadable artifacts should be produced from durable source, not arbitrary unsaved editor memory.

### Local Preview Error

```txt
Editor: inline diagnostic marker
Preview: error placeholder
Bottom Panel: local preview diagnostics selected
```

The user should understand whether this is a browser preview issue or Typst compile issue without needing backend terminology.

### Preview Updating

```txt
Status Chip: Preview updating
Preview: keeps last successful output visible
Bottom Panel: collapsed unless diagnostics appear
```

### Preview Failed

```txt
Preview remains on latest successful output
Top Bar: Preview failed
Bottom Panel opens to diagnostics
```

### Preview Ready

```txt
Top Bar: Preview ready
Preview: updated document output
Actions: Download PDF, Download SVG if available
```

## Snapshot And Render UX

The editor needs a clear mental model for source state versus render state.

```txt
Editor changes
  -> autosaved draft or explicit save
  -> committed project snapshot
  -> preview/export renderer uses latest durable source
  -> downloadable artifact is updated when rendering succeeds
```

Recommended labels:

- `Saved` means the project source is durable.
- `Unsaved changes` means source edits are not durable yet.
- `Snapshot ready` means export/download can use the latest durable source.
- `Rendering` means preview/export output is being refreshed.
- `Preview ready` means typst.ts produced local visual feedback.

Avoid using only one generic `Saved` or `Synced` label for all of these states.

## Diagnostics UX

Diagnostics should exist in three layers:

- Inline editor markers for exact source locations.
- Preview placeholder for high-level failure context.
- Bottom panel for full diagnostics and recent render status.

Wireframe:

```txt
+------------------------------------------------------------------------------+
| Diagnostics                                                                  |
+----------+---------+---------------------------------------------------------+
| Severity | Source  | Message                                                 |
+----------+---------+---------------------------------------------------------+
| Error    | main:12 | Unknown variable: total                                 |
| Warning  | main:26 | Font fallback used                                      |
+----------+---------+---------------------------------------------------------+
```

Clicking a diagnostic should focus the editor location when source location is available.

## File Tree UX

Minimum MVP actions:

- Create file.
- Rename file.
- Delete file.
- Upload asset.
- Show active file.
- Show dirty indicator at file or project level.

Possible later actions:

- Drag-and-drop reordering or moves.
- Context menus.
- Multi-select.
- Template insertion.

## Preview UX

Minimum MVP controls:

- Zoom in/out.
- Fit width.
- Page navigation.
- Refresh/recompile local preview if automatic preview stalls.
- Toggle local preview versus latest server artifact when both exist.

Rendered document pages should sit on a neutral canvas so white PDF pages do not visually merge with either light or dark app backgrounds.

## Top Bar Contents

Recommended MVP top bar order:

```txt
[Workspace] / [Project] / [Active file]      [Save state] [Preview state] [Export PDF] [Download] [Settings]
```

Export/download actions should be easy to find but not more visually dominant than the editor itself.

## Accessibility Notes

- Pane resizing must be keyboard accessible or have non-resize fallbacks.
- Editor, preview, file tree, and diagnostics need logical focus order.
- Diagnostics must not rely on color alone.
- Preview/render status should be announced with polite live regions.
- Touch targets on tablet/mobile should be at least 44px.
- Dark mode contrast should be validated for shell text, controls, focus rings, and diagnostics.

## Sketch Checklist

Use this checklist while producing visual wireframes.

- Does the user know what project and file they are editing?
- Does the user know whether edits are saved?
- Does the user know whether the preview is local or server-rendered?
- Can the user recover from a Typst compile error?
- Can the user download the latest rendered PDF?
- Does the layout still work with the file tree collapsed?
- Does the layout still work with the preview collapsed?
- Is dark mode treated as a primary design target?
- Is mobile usable for quick review and download?

## Open UX Decisions

- Should autosave be mandatory in MVP, or should MVP use explicit save only?
- Should export automatically create a snapshot, or require saving first?
- Should the preview default to local typst.ts output, latest server artifact, or a toggle?
- Should diagnostics appear in a bottom panel, right drawer, or both depending on viewport?
- Should templates be part of first-run project creation in milestone 1?
- Should mobile editing be supported as a committed MVP requirement or best-effort responsive behavior?
