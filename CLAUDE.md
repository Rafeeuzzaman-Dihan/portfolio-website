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
- `--font-mono` — JetBrains Mono, for small HUD-style labels

No ad-hoc hex colors in components. The one exception is tech-stack brand colours: each skill in `content/skills.json` carries its real `brand` hex (content, not styling), used only for that logo's hover glow. Use the semantic tokens (e.g. `bg-(--color-bg)`, `text-(--color-primary)`, `font-heading`) everywhere. If a new color is genuinely needed, add it as a token in `@theme`, don't inline it.

Two reusable, low-opacity (5-10%) background texture components live in `app/components/backgrounds/`: `DotGridBackground` and `BlueprintBackground`, auto-imported by Nuxt as `<BackgroundsDotGridBackground />` and `<BackgroundsBlueprintBackground />` (subdirectory-prefixed). Drop one inside a `relative` positioned section to add a subtle dot-grid or blueprint/linework layer that fades out at the edges via `mask-image`. Never use gradient blobs or generic AI-style gradient backgrounds.

A `section-container` utility class (defined in `main.css` via `@utility`) gives consistent max-width and horizontal padding across all breakpoints — use it as the outer wrapper for every section's content.

## Personal direction (agreed with the owner)

The site is personal, not corporate: a professional dark-blueprint base with a **personal touch**. Keep clarity and credibility first; personality lives in details (copy, motion, small HUD-style elements), not in a re-skin. Do not change the palette to a hobby theme.

About the owner (Rafeeuzzaman Dihan), used to guide copy, motion and small details:

- Roles he identifies with: Software Engineer, Gamer, Streamer, Photographer, Editor.
- Games: Call of Duty is his favourite series (HUD / targeting-reticle language fits).
- Screen: crime thrillers and suspense. Favourites are Inception (movie) and Breaking Bad (series).
- Football: Real Madrid supporter.
- Also enjoys travelling. Two years of professional experience as a Software Engineer.
- Coding is a genuine passion, not just a job.

Where the personality goes: hero HUD details and copy first; later sections may carry small nods (Real Madrid, Inception, Breaking Bad). Never gimmicks that hurt readability or performance.

### Hero copy structure

```
Hello, I am
[Name]
I am a(n) [rotating role]
```

- Roles live in `content/profile.json`, each with its own article (`"a"` / `"an"`), e.g. `{ "label": "Editor", "article": "an" }`. The article is content, never guessed in a component (English a/an follows sound, not letters). The article animates together with its word.
- The rotating role must use a distinctive, role-specific transition. Generic slide/fade swaps and the paper-crumple idea were both rejected; do not reintroduce them.

### Hero decisions (approved in the prototype)

- "Dihan" is the owner's nickname: render it in `--color-primary`, the rest of the name in the normal text color.
- The hero stays minimal: eyebrow, name, role line, bio, two CTAs, scroll cue. **No** hobby chips ("Off the clock"), local-time/status block, per-role readout tags, or role timeline/pager.
- The rotating role word sits on the page with **no frame, box or corner brackets** around it. Its five role-specific transitions stay: compile (Software Engineer), glitch (Gamer), live wipe (Streamer), rack focus with shutter flash (Photographer), playhead cut (Editor).
- Scroll cue is a game-style keycap that presses, ripples and draws a line toward the next section (replaces the ruler indicator).
- Hobbies live in the copy and motion choices, not in visible hobby lists.
- The hero bio is a short, friendly first-person "about me" written by the owner (`bio` in `content/profile.json`): role and location, two years of experience, then gaming, streaming, travelling, photography and Real Madrid. It names no tech stack. Do not rewrite it without asking.
- Implementation: `HeroSection.vue` reads `content/profile.json` (`greeting`, `nickname`, `rolePrefix`, `roles[{label, article, effect}]`); the rotating line is `app/components/RotatingRole.vue` driven by `app/composables/useRoleTransition.ts`; the scroll cue is `app/components/ScrollIndicator.vue`. To add a role, add an entry to `roles` (an existing `effect` reuses that transition; a new effect needs a branch in the composable).

### Navbar (approved and implemented in `app/components/layout/AppHeader.vue`)

- A floating glass pill, centered near the top, replaces the full-width bar: logo, the six section links, a Resume button (PDF from `profile.resumeUrl`).
- Extras: a sliding highlight on the active section's link (scroll-spy), and a thin progress line along the pill's bottom edge that fills with page scroll.
- **No "Let's talk" button**: Contact is already a section and a nav link.
- Below `lg` (1024px) the pill is compact (logo + menu button) and opens a slide-down panel with the links and Resume. **No numbers** on the mobile links.

### Expertise section (approved and implemented in `app/components/sections/ExpertiseSection.vue`)

- Section titles use `app/components/SectionTitle.vue`: a solid heading with a small primary square. **No** huge outlined word or running light behind it (tried and removed by the owner). Reuse it for other section titles.
- Expertise = five areas (Frontend, Backend & API, Database Management, DevOps & Deployment, Tools & Workflow). Keep text minimal: each area is an icon, a title, a ~6-word `tagline` and its `tools` (names that must exist in `content/skills.json`, which supplies logo and brand colour). Every skill in `skills.json` appears in exactly one area. No long descriptions and no "used in" projects. Icons come from the Solar bold-duotone set.
- Layout is the **Loadout** (`expertise/Loadout.vue`), a Call of Duty class-select nod: on `lg`+ the areas are listed on the left and the selected one loads into a HUD panel on the right (corner marks, `01 / 05` readout, tools in a 3-column grid). Corner brackets snap onto the selected area. The areas auto-cycle every 3.5s with a timer bar once the section is on screen, until the visitor hovers, focuses or clicks one; no auto-cycle under reduced motion. Switching must feel quick (~0.3s swap). Below `lg` every area is a card with its tagline and logos.
- Rejected for this section (don't reintroduce): icon + title + paragraph cards (plain, tilted, or spotlight), live-animation bento cards, code-file/editor cards (too technical for non-developers), long descriptions.
- No "What I build" list here: it overlapped the Services section, so the owner removed it. Service names (SaaS, E-commerce, CRM & Inventory, MVPs, Esports Platforms…) belong in Services. ERP is deliberately not listed anywhere.
- **No separate Tech Stack block**: it repeated the Loadout's logos, so the owner merged every tool into the Loadout. Tool logos use their **real brand colours** (not the site palette); near-black marks (GitHub, Vercel, AWS text) use their white dark-mode variants.
- Only list tools the owner actually uses; no library lists. Logos live in the offline subsets under `app/assets/icons/`; after adding a logo or icon, add it to `scripts/build-icon-subsets.mjs` and run `yarn icons`.

### Process

- For a major visual change, prototype it as an Artifact first and get approval before changing site code.
- When a decision is genuinely the owner's, ask with concrete options instead of assuming.
- Record agreed design decisions in this file so they survive across sessions.

## No backend

This is a fully static site: no admin panel, no backend, no database. Content changes happen by editing files under `/content`, not through a CMS or API.
