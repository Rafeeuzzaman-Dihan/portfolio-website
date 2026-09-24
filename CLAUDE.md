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
- `--font-mono` — JetBrains Mono, for small HUD-style labels and the hero terminal
- `--font-hud` — Rajdhani, condensed uppercase for Call of Duty-style HUD text (hero callsign)

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

- "Dihan" is the owner's nickname. The name is **stacked**: the first name small, uppercase and widely tracked, then the nickname huge in `--color-primary`; its letters drop in and a glowing bar draws under them.
- Layout: two columns on `lg`+ (text left, dossier terminal right); below `lg` the terminal stacks under the text. The role line is sized down on `lg`/`xl` so it fits the text column; its animation is unchanged.
- The hero stays focused: eyebrow, name, role line, bio, two CTAs, scroll cue, plus the **operator dossier terminal**. **No** hobby chips ("Off the clock"), local-time/status block, per-role readout tags, or role timeline/pager.
- Dossier terminal (`app/components/hero/DossierTerminal.vue`, content in `profile.dossier`): a retro **CRT monitor** that switches on. A **projected hologram keyboard** appears over the lower half of the screen (where the file later shows, so it takes no extra space and nothing shifts; it scales down on phones) (`app/components/hero/HoloKeyboard.vue`, glowing outline keys tilted flat) types `$ ssh dihan@virus_00 --decrypt` and a masked passphrase, each key pressing, glowing and rippling (Shift for capitals, `_` and `@`). Then a "DECRYPTING FILE ViRUS_00" bar runs to ACCESS GRANTED, the keyboard does a light sweep and **dissolves into scanlines**, the **CALLSIGN** label with **DIHAN** glitches in, and each file line (role, specialty, squad, base, main tech, comms, service, Inception motto) decodes from 0s and 1s. The full name is **not** repeated under the callsign. Screen readers get the file immediately; reduced motion shows the finished screen with no keyboard. The whole intro takes about 5 seconds; keep it quick. Only static facts that never need live updating.
- CTAs are **keycap buttons**: each carries a 3D keycap (a bold Enter icon on "View Work", "C" on "Contact Me") that presses down while the button lifts on hover. The keys are real: Enter/C jump to #projects/#contact while the hero is in view, ignored in form fields, on focused links/buttons and with modifier keys. Rejected CTA styles: HUD cut-corner, terminal-command, reticle, glow pill, split HUD.
- **No photos anywhere on the site** (no portrait, avatar or placeholder): the owner's explicit choice. Rejected hero-card ideas: player/ID passes, photo cards, dog tags, mission maps, device frames other than the CRT, live WakaTime stats (can't update in real time on a static site). Rejected keyboard looks: mechanical and laptop.
- The rotating role word sits on the page with **no frame, box or corner brackets** around it. Its five role-specific transitions stay: compile (Software Engineer), glitch (Gamer), live wipe (Streamer), rack focus with shutter flash (Photographer), playhead cut (Editor).
- Scroll cue is a game-style keycap that presses, ripples and draws a line toward the next section (replaces the ruler indicator).
- Hobbies live in the copy and motion choices, not in visible hobby lists.
- The hero bio (`bio` in `content/profile.json`) was agreed word for word with the owner: "Software Engineer by profession, gamer by passion. When I'm not building for the web, I'm streaming, editing videos, travelling or capturing moments through my lens. And yes, Real Madrid is the best club in the world." It covers all his hobbies and names no tech stack (the terminal carries the facts). Do not rewrite it without asking.
- Implementation: `HeroSection.vue` reads `content/profile.json` (`greeting`, `nickname`, `rolePrefix`, `roles[{label, article, effect}]`); the rotating line is `app/components/RotatingRole.vue` driven by `app/composables/useRoleTransition.ts`; the scroll cue is `app/components/ScrollIndicator.vue`. To add a role, add an entry to `roles` (an existing `effect` reuses that transition; a new effect needs a branch in the composable).

### Navbar (approved and implemented in `app/components/layout/AppHeader.vue`)

- A floating glass pill, centered near the top, replaces the full-width bar: logo, the six section links, a Resume button (PDF from `profile.resumeUrl`).
- Extras: a sliding highlight on the active section's link (scroll-spy), and a thin progress line along the pill's bottom edge that fills with page scroll.
- **No "Let's talk" button**: Contact is already a section and a nav link.
- Below `lg` (1024px) the pill is compact (logo + menu button) and opens a slide-down panel with the links and Resume. **No numbers** on the mobile links.

### Expertise section (approved and implemented in `app/components/sections/ExpertiseSection.vue`)

- Section titles use `app/components/SectionTitle.vue`: a solid heading with a small primary square. **No** huge outlined word or running light behind it (tried and removed by the owner). Reuse it for other section titles.
- Expertise = five areas (Frontend, Backend & API, Database Management, DevOps & Deployment, Tools & Workflow). Keep text minimal: each area is an icon, a title, a ~6-word `tagline` and its `tools` (names that must exist in `content/skills.json`, which supplies logo and brand colour). Every skill in `skills.json` appears in exactly one area. No long descriptions and no "used in" projects. Icons come from the Solar bold-duotone set.
- Layout is the **Loadout** (`expertise/Loadout.vue`), a Call of Duty class-select nod: on `lg`+ the areas are listed on the left and the selected one loads into a HUD panel on the right (corner marks, `01 / 05` readout, tools in a 3-column grid). One **selector frame glides** between areas (border, glow, timer bar), and its corner brackets lock on each time it arrives. The panel cross-fades: the old area slides out (~0.14s), the new one slides in from the direction of travel with a slight blur-to-sharp, a thin scan light passes down the panel, and the tools follow one by one. The areas auto-cycle every **2.5s** once the section is on screen; once the visitor hovers, focuses or clicks an area, it never restarts. No auto-cycle under reduced motion. Below `lg` every area is a card with its tagline and logos.
- Rejected for this section (don't reintroduce): icon + title + paragraph cards (plain, tilted, or spotlight), live-animation bento cards, code-file/editor cards (too technical for non-developers), long descriptions.
- No "What I build" list here: it overlapped the Services section, so the owner removed it. Service names (SaaS, E-commerce, CRM & Inventory, MVPs, Esports Platforms…) belong in Services. ERP is deliberately not listed anywhere.
- **No separate Tech Stack block**: it repeated the Loadout's logos, so the owner merged every tool into the Loadout. Tool logos use their **real brand colours** (not the site palette); near-black marks (GitHub, Vercel, AWS text) use their white dark-mode variants.
- Only list tools the owner actually uses; no library lists. Logos live in the offline subsets under `app/assets/icons/` (Lucide, brand logos, Solar); after adding a logo or icon, add it to `scripts/build-icon-subsets.mjs` and run `yarn icons`.

### Experience section (approved and implemented in `app/components/sections/ExperienceSection.vue`)

- Real history in `content/experience.json`, newest first: Virtuoso Leagues (Software Engineer, Apr 2026 – Present, Singapore, Remote), then BD Funnel Builder Limited (Dhaka, On-site): Jr. Software Engineer (Jan–Mar 2026), Software Engineer Trainee (Apr–Dec 2025), Software Engineer Intern (Jan–Mar 2025). Bullets are short (2–3 per role), shortened from the owner's LinkedIn.
- Layout is **Chapters**: roles grouped by start year; a huge year on the left (sticky on `lg`+), that year's roles on the right.
- Each role card (`experience/RoleCard.vue`): role, company name on its own line, a solid primary **duration badge written in full** ("3 Months", computed from the dates; "Present" counts to the current month), then separate fact chips with icons for dates, city and Remote/On-site. **No** "·"-separated company/location line, **no** Promoted badge, **no** tech logos, **no** year subtitles like "2 roles · Remote".
- Motion is the **progress rail**: a line beside each chapter fills as the reading line (55% down the viewport) passes; cards wait dimmed until reached, then their node lights, the duration badge pops and counts up from 0, and the fact chips snap in. The year of the chapter under the reading line lights up. Reduced motion shows everything reached, with no animation.
- Rejected for this section: rank-up/promotion badges, company cards with role switcher, Gantt-style timeline bars, match-history rows, year tabs, watermark years.

### Process

- For a major visual change, prototype it as an Artifact first and get approval before changing site code.
- When a decision is genuinely the owner's, ask with concrete options instead of assuming.
- Record agreed design decisions in this file so they survive across sessions.

## No backend

This is a fully static site: no admin panel, no backend, no database. Content changes happen by editing files under `/content`, not through a CMS or API.
