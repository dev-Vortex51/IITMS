# IITMS Design System

This document is the single source of truth for UI foundations, components, patterns, content rules, and governance.

## 1. Foundations

### Color palette
Tokens are defined in `client/src/styles/globals.css` as CSS variables and mapped into Tailwind in `client/tailwind.config.ts`.

- Core: `--background`, `--foreground`, `--card`, `--popover`
- Semantic: `--primary`, `--secondary`, `--accent`, `--muted`, `--destructive`
- Utilities: `--border`, `--input`, `--ring`

Usage rules:
- Use `primary` for primary actions, focus states, and main accents.
- Use `accent` for highlighting and callouts.
- Use `muted` for low emphasis UI (subtle borders, muted text, background fills).
- Use `destructive` only for destructive actions or error states.

### Typography
Tokens are defined in `client/src/styles/globals.css` and mapped into Tailwind in `client/tailwind.config.ts`.

- Font: `--font-sans`
- Scale: `--text-xs` to `--text-5xl`

Usage rules:
- Page titles: `text-3xl` or `text-4xl`.
- Section titles: `text-xl` or `text-2xl`.
- Body: `text-sm` or `text-base`.
- UI labels: `text-xs` or `text-sm`.

### Spacing and layout
Spacing tokens are defined in `client/src/styles/globals.css`.

- `--space-1` to `--space-8` map from 0.25rem to 2rem.
- Standard layout gap is `space-y-6` for page sections.

### Elevation and borders
Shadows are defined as CSS variables and mapped into Tailwind in `client/tailwind.config.ts`.

- `--shadow-sm`, `--shadow-md`, `--shadow-lg`

Usage rules:
- `shadow-sm` for cards and list items.
- `shadow-md` for modals and focus surfaces.
- `shadow-lg` for high emphasis surfaces.

### Iconography
Use `lucide-react` icons for consistency. Icon size defaults:
- Inline: 16px
- Section icons: 20–24px
- Empty states: 24–32px

### Motion
Motion is minimal and functional.
- Accordion animations are defined in `client/tailwind.config.ts`.
- Use `transition-colors` for hover state changes.

## 2. Components

Base UI primitives live in:
- `client/src/components/ui`

Design system wrappers live in:
- `client/src/components/design-system`

Rules:
- All new screens should use primitives for inputs, buttons, tables, dialogs, and cards.
- Prefer design-system wrappers for page headers, empty states, and sectioned content.
- Use shared error states:
  - Local: `ErrorLocalState`
  - Global: `ErrorGlobalState` (also used by app `ErrorBoundary`)

## 3. Patterns

Patterns are composed from primitives and wrappers. Examples:
- Page layouts should use `PageHeader` + section cards.
- Empty states should use `EmptyState` and a primary action.
- Detail views should group information in `Section` cards.

## 4. Content and UX guidelines

- Voice: clear, direct, professional.
- Microcopy: action-led and concise.
- Errors: explain the problem and the next step.
- Accessibility: ensure adequate contrast and focus states; all inputs must have labels.

## 5. Implementation

- Tokens and base styles: `client/src/styles/globals.css`.
- Tailwind token wiring: `client/tailwind.config.ts`.
- Component library: `client/src/components/ui`.
- Design system wrappers: `client/src/components/design-system`.

## 6. Governance

- New components must be added to `components/ui` or `components/design-system`.
- Do not introduce ad hoc button/input styles in page components.
- Update this document when new primitives or patterns are added.
- Review: changes to tokens or core components require a UI review.
- Automated conformance checks:
  - `cd client && npm run lint:design` validates route-level design-system/auth composition and blocks raw inline style/hex color usage.
  - `cd client && npm run lint:all` runs both ESLint and design conformance checks.
