# Milestone 3: Frontend Design System

## Goal

Create the product's visual language, interaction model, and reusable UI system after the core self-host and collaboration architecture are validated.

This milestone should be handled as a dedicated frontend design task. Implementation before this milestone should preserve enough structure for good design work but should not try to finalize the product aesthetic prematurely.

## User Outcome

The app should feel like a professional Typst authoring environment rather than a generic dashboard. It should be comfortable for long writing/editing sessions and excellent in dark mode.

## Design Ownership

Let a frontend design pass define:

- visual language
- typography
- spacing system
- color palette
- dark mode treatment
- component style
- editor/preview layout
- responsive behavior
- empty states
- loading states
- error states

Do not lock these choices in milestone 1 unless required for usability.

## Requirements

Dark mode:

- first-class experience
- not a simple inverted afterthought
- editor, preview, sidebars, dialogs, and code/error surfaces must all be readable

Accessibility:

- keyboard navigation
- visible focus states
- sufficient contrast
- semantic headings and regions
- screen-reader-friendly status updates where practical

Responsive behavior:

- desktop-first editing layout
- usable tablet layout
- mobile should support project navigation and basic reading/preview, even if heavy editing is not the primary use case

Editor ergonomics:

- split editor/preview layout
- resizable panes if practical
- clear render status
- clear local preview diagnostics
- clear server render diagnostics
- font and line-height choices suitable for long Typst editing sessions

Self-hosting UX:

- first-run setup should be understandable
- errors should mention missing environment/configuration clearly
- admin/settings areas should not feel like raw infrastructure dashboards

## Candidate Screens To Design

- first-run/landing screen
- workspace/project list
- editor shell
- render status panel
- artifact/download panel
- settings screen
- template/font/package registry screens
- collaboration presence states from milestone 2
- empty project state
- Typst compile error state
- storage/configuration error state

## Testing Requirements

- Playwright visual smoke coverage for critical routes
- dark mode E2E smoke test
- accessibility checks on key screens
- keyboard navigation smoke test for editor shell controls
- responsive viewport smoke tests

## Acceptance Criteria

- Product has a coherent design direction.
- Dark mode is polished and comfortable.
- Core workflows remain fast and clear.
- Components are reusable and documented enough for future features.
- Visual design does not compromise self-host simplicity or editor performance.

## Non-Goals

- Reworking core backend architecture
- Replacing Convex/RustFS/worker decisions
- Adding SaaS billing or marketing workflows
- Building every possible admin screen
