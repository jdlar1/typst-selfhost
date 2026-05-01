# Design Direction

Typst Self-Host should feel like a focused document IDE, not a marketing site or generic SaaS dashboard. The visual foundation is shadcn/ui-compatible, but tuned toward a warmer Convex-like developer product aesthetic: dark workspace, soft borders, confident accent colors, subtle gradients, and high readability for long writing sessions.

This is the M1 design contract. Keep it lightweight. Use Tailwind CSS v4 and shadcn/ui-style components for implementation rather than a large hand-written CSS layer.

## Principles

- Dark mode is the primary experience.
- The editor and preview are the center of gravity.
- The app root starts with one first-run setup flow until the superuser exists.
- After setup, the product should open directly into the editor workspace.
- Admin is a profile/avatar menu mode, not a primary navigation tab.
- Use calm contrast, not pure black/white glare.
- Prefer warm ink, violet, amber, and soft blue accents over generic gray/blue SaaS colors.
- Make infrastructure state visible but not noisy.
- Keep controls plain, readable, and keyboard-friendly.
- Avoid glassmorphism overload, neon cyberpunk, and dashboard clutter.

## Visual References

Use shadcn/ui as the component baseline:

- CSS variable tokens.
- Neutral surfaces.
- Radius-based cards and controls.
- Clear focus rings.
- Low-animation interaction states.
- Local components live in `app/src/components/ui/`.
- Shared class composition uses `app/src/lib/utils.ts` and `cn()`.

Convex-like tweak:

- Warmer dark background.
- Slightly playful violet/pink accent energy.
- Developer-console clarity.
- Subtle gradient glows behind hero/editor areas.
- Rounded but not bubbly panels.

## Palette

### Dark Theme

Use this as the primary palette.

```css
:root[data-theme="dark"] {
  --background: 24 18 15;          /* #18120f */
  --foreground: 252 244 232;       /* #fcf4e8 */

  --card: 31 24 21;                /* #1f1815 */
  --card-foreground: 252 244 232;  /* #fcf4e8 */

  --popover: 35 27 23;             /* #231b17 */
  --popover-foreground: 252 244 232;

  --primary: 154 121 255;          /* #9a79ff */
  --primary-foreground: 18 12 25;  /* #120c19 */

  --secondary: 48 38 33;           /* #302621 */
  --secondary-foreground: 245 231 213;

  --muted: 45 37 33;               /* #2d2521 */
  --muted-foreground: 181 166 146; /* #b5a692 */

  --accent: 255 177 93;            /* #ffb15d */
  --accent-foreground: 34 20 9;

  --destructive: 255 91 91;        /* #ff5b5b */
  --destructive-foreground: 255 246 240;

  --success: 82 211 147;           /* #52d393 */
  --success-foreground: 8 38 24;

  --warning: 255 202 99;           /* #ffca63 */
  --warning-foreground: 46 31 6;

  --border: 67 55 49;              /* #433731 */
  --input: 67 55 49;
  --ring: 154 121 255;

  --editor: 16 17 20;              /* #101114 */
  --editor-foreground: 235 232 224;
  --editor-gutter: 31 32 37;
  --editor-selection: 74 58 130;

  --preview: 244 236 223;          /* #f4ecdf */
  --preview-foreground: 31 24 21;

  --radius: 0.875rem;
}
```

### Light Theme

Light mode exists, but M1 should optimize dark mode first.

```css
:root[data-theme="light"] {
  --background: 250 247 241;       /* #faf7f1 */
  --foreground: 31 24 21;          /* #1f1815 */

  --card: 255 252 247;             /* #fffcf7 */
  --card-foreground: 31 24 21;

  --popover: 255 252 247;
  --popover-foreground: 31 24 21;

  --primary: 116 83 232;           /* #7453e8 */
  --primary-foreground: 255 252 247;

  --secondary: 241 233 221;        /* #f1e9dd */
  --secondary-foreground: 57 44 37;

  --muted: 244 238 229;            /* #f4eee5 */
  --muted-foreground: 111 94 78;

  --accent: 218 112 45;            /* #da702d */
  --accent-foreground: 255 249 242;

  --destructive: 204 55 55;
  --destructive-foreground: 255 250 245;

  --success: 24 142 86;
  --success-foreground: 245 255 250;

  --warning: 171 110 10;
  --warning-foreground: 255 250 238;

  --border: 223 213 199;
  --input: 223 213 199;
  --ring: 116 83 232;

  --editor: 252 250 246;
  --editor-foreground: 34 29 25;
  --editor-gutter: 238 232 222;
  --editor-selection: 220 207 255;

  --preview: 255 255 255;
  --preview-foreground: 31 24 21;

  --radius: 0.875rem;
}
```

## Tailwind Usage

Follow shadcn-style RGB channel variables so opacity can be applied cleanly. Tailwind v4 is configured through `@import "tailwindcss"` and `@theme` in `app/src/styles/app.css`.

```tsx
<Card className="bg-card/90 text-card-foreground">
  <CardHeader>
    <CardTitle>Create the superuser.</CardTitle>
  </CardHeader>
</Card>
```

## Typography

Default fonts:

- UI: `Inter`, `ui-sans-serif`, `system-ui`, `sans-serif`.
- Editor: `JetBrains Mono`, `SFMono-Regular`, `Consolas`, monospace.
- Preview/document: keep Typst output independent, but frame it with warm paper colors.

Scale:

```txt
Hero:       48-64px, 0.95 line-height, -0.04em tracking
Page h1:    32-44px, 1.05 line-height, -0.03em tracking
Section h2: 20-24px, 1.2 line-height
Body:       15-16px, 1.65 line-height
Small:      13-14px, 1.5 line-height
Code:       13-14px, 1.6 line-height
```

Use font weight sparingly:

- `700` for hero/page headings.
- `600` for section titles and active nav.
- `500` for buttons, labels, badges.
- `400` for body text.

## Layout

### App Shell

The shell should feel like a workspace.

- Sticky or visually anchored topbar.
- Brand on the left.
- Instance/setup status and profile menu on the right.
- Avoid top-level navigation tabs during M1.
- Max width for marketing/setup/admin pages: `1120px` to `1200px`.
- Editor page can use near full width: `min(1600px, calc(100vw - 32px))`.

### Editor

Desktop layout:

```txt
file tree      editor                 preview/render panel
260px          minmax(480px, 1fr)     minmax(360px, 0.8fr)
```

Mobile/tablet layout:

- Stack panels vertically.
- Keep file tree collapsed or compact.
- Editor before preview.
- Render/download panel should remain reachable without horizontal scrolling.

### Surfaces

Use three surface levels:

- Page background: `--background` with subtle radial glows.
- Panels/cards: `--card` with 1px border.
- Inputs/editor: deeper inset surface.

Recommended background treatment:

```css
background:
  radial-gradient(circle at 15% 10%, rgb(var(--primary) / 0.18), transparent 34rem),
  radial-gradient(circle at 85% 0%, rgb(var(--accent) / 0.10), transparent 30rem),
  rgb(var(--background));
```

## Components

### Buttons

Variants:

- Primary: violet fill, dark foreground.
- Secondary: muted surface, foreground text.
- Ghost: transparent, visible hover.
- Danger: destructive fill only for irreversible actions.

Button rules:

- Minimum height: `40px`.
- Border radius: `999px` for primary CTAs, `10px` for dense editor controls.
- Hover: small brightness shift, no dramatic movement.
- Focus: `2px` ring using `--ring`.

### Cards

Cards should feel like grouped work surfaces, not floating marketing tiles.

- Border: `rgb(var(--border))`.
- Background: `rgb(var(--card) / 0.86)`.
- Radius: `var(--radius)`.
- Shadow: subtle, mostly dark ambient shadow.

### Inputs

- Background: `rgb(var(--background) / 0.45)` or `rgb(var(--muted))`.
- Border: `rgb(var(--border))`.
- Focus ring: `rgb(var(--ring) / 0.35)`.
- Labels are always visible; placeholders are examples only.

### Badges And Status Pills

Use status pills for self-host state:

- `Setup required`
- `Signup closed`
- `Autosaved`
- `Worker idle`
- `Render queued`
- `Render failed`

Pills should be compact, bordered, and color-coded only when useful.

## Interaction

Motion should be restrained.

```css
:root {
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-fast: 140ms;
  --duration-normal: 220ms;
}
```

Use transitions for:

- Button hover.
- Focus rings.
- Panel hover on clickable cards.
- Save/render status changes.

Avoid:

- Page-wide animations.
- Bouncy easing.
- Motion that distracts from writing.

## Accessibility

Minimum requirements:

- Normal text contrast: 4.5:1.
- Large text/UI contrast: 3:1.
- Visible keyboard focus on all controls.
- Real labels for all form inputs.
- Semantic landmarks: `header`, `nav`, `main`, `section`, `aside`.
- Status messages should eventually use `aria-live` where state changes asynchronously.

Editor-specific requirements:

- Code text must remain readable for long sessions.
- Diagnostics must not rely only on color.
- Preview panel must have a clear text fallback when rendering fails.

## Implementation Guidance For Current App

Current UI implementation should prefer shadcn components and Tailwind utilities:

```txt
app/src/components/ui/button.tsx
app/src/components/ui/card.tsx
app/src/components/ui/input.tsx
app/src/components/ui/badge.tsx
app/src/lib/utils.ts
app/src/styles/app.css
```

Keep `app/src/styles/app.css` limited to Tailwind import, theme tokens, and base page styles. Do not rebuild large pure-CSS component classes.

## Do Not Do Yet

- Do not bypass shadcn-style components for large route-specific CSS blocks.
- Do not add a parallel styling system next to Tailwind.
- Do not design a marketing landing page before the editor loop works.
- Do not add tabbed top navigation unless there are real app sections that need it.
- Do not hide current implementation limitations behind polished UI copy.
