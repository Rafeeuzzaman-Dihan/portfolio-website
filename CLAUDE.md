# CLAUDE.md

Permanent architectural rules for this project. These are not suggestions — follow them for every change unless the user explicitly overrides one in the moment.

## Stack

- Nuxt 4 (`app/` directory structure), TypeScript, Tailwind CSS 4 via `@tailwindcss/vite`, ESLint (`@nuxt/eslint`), Yarn.

## Single-page architecture

This is a single-page portfolio site: one main page with anchor-linked sections (e.g. `#projects`, `#experience`, `#skills`). Do not introduce multi-page routing (`pages/` router-driven navigation) for the core site. New sections are added as components on the one page, linked via in-page anchors/smooth scroll — not new routes.

## Content lives outside components

Projects, experience, testimonials, and skills must live in structured content files (JSON or Markdown under `/content`), never hardcoded directly into `.vue` components. Components read from content files and render them. This keeps the site editable without touching component code. When adding a new content-driven section, create/extend a content file first, then build the component to consume it.

## Mobile-first responsive design (mandatory)

Design and implement mobile-first. Required breakpoints:

| Breakpoint | Width  | Target              |
|------------|--------|---------------------|
| (base)     | 375px  | Mobile              |
| `sm`       | 640px  | Large mobile / small tablet |
| `md`       | 768px  | Tablet               |
| `lg`       | 1024px | Laptop                |
| `xl`       | 1280px+| Desktop                |

Every component must be responsive-checked at all five breakpoints before being considered done.

## Theming: CSS custom properties via Tailwind v4 `@theme`

Theming is defined once, in CSS, via Tailwind v4's `@theme` directive (see `app/assets/css/main.css`). Only these tokens exist:

- `--color-bg` — near-black base background
- `--color-bg-elevated` — panel/card background
- `--color-primary` — electric blue accent
- `--color-primary-light` — lighter blue, for hover states
- `--color-secondary` — muted slate-blue-gray accent
- `--color-text` — off-white body text
- `--color-text-muted` — dimmer gray-blue text
- `--color-border` — low-opacity blue-gray, for card borders
- `--font-heading` — Space Grotesk, for headings
- `--font-body` — Inter, for body copy

No ad-hoc hex colors in components. Use the semantic tokens (e.g. `bg-(--color-bg)`, `text-(--color-primary)`, `font-heading`) everywhere. If a new color is genuinely needed, add it as a token in `@theme`, don't inline it.

Two reusable, low-opacity (5-10%) background texture components live in `app/components/backgrounds/`: `DotGridBackground` and `BlueprintBackground`, auto-imported by Nuxt as `<BackgroundsDotGridBackground />` and `<BackgroundsBlueprintBackground />` (subdirectory-prefixed). Drop one inside a `relative` positioned section to add a subtle dot-grid or blueprint/linework layer that fades out at the edges via `mask-image`. Never use gradient blobs or generic AI-style gradient backgrounds.

A `section-container` utility class (defined in `main.css` via `@utility`) gives consistent max-width and horizontal padding across all breakpoints — use it as the outer wrapper for every section's content.

## No backend

This is a fully static site: no admin panel, no backend, no database. Content changes happen by editing files under `/content`, not through a CMS or API.
