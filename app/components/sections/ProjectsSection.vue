<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const PER_PAGE = 6
const CYCLE_MS = 2500
const STAGGER_MS = 180
// A card's decrypt: 700ms progress bar, then ~900ms while its details arrive.
const CARD_INTRO_MS = 1600

const page = ref(0)
const pageCount = Math.ceil(projects.length / PER_PAGE)
const shown = computed(() => projects.slice(page.value * PER_PAGE, (page.value + 1) * PER_PAGE))
const pad = (n: number) => String(n).padStart(2, '0')

// Intro: cards wait behind the decrypt screen until the section scrolls into view, then decrypt in a wave.
// Nothing is hidden on the server or under reduced motion.
const armed = ref(false)
const play = ref(false)
const introRunning = ref(false)
let reduced = false
let desktop = false

// Selector (lg+ only): a frame glides from card to card every 2.5s, the selected card lifts.
// Once the visitor hovers, focuses or clicks a card, the auto-scan stops for good.
const gridEl = ref<HTMLElement | null>(null)
const active = ref(-1)
const auto = ref(false)
let picked = false
const frame = ref({ x: 0, y: 0, w: 0, h: 0, ready: false })

let introTimer: ReturnType<typeof setTimeout> | undefined
let cycleTimer: ReturnType<typeof setTimeout> | undefined

function placeFrame() {
  const card = gridEl.value?.querySelectorAll<HTMLElement>('[data-card]')[active.value]
  frame.value = card
    ? { x: card.offsetLeft, y: card.offsetTop, w: card.offsetWidth, h: card.offsetHeight, ready: true }
    : { ...frame.value, ready: false }
}

function scheduleNext() {
  clearTimeout(cycleTimer)
  if (auto.value) cycleTimer = setTimeout(() => (active.value = (active.value + 1) % shown.value.length), CYCLE_MS)
}

function startIntro() {
  clearTimeout(introTimer)
  introRunning.value = true
  play.value = true
  introTimer = setTimeout(() => {
    introRunning.value = false
    if (desktop && !picked) {
      auto.value = true
      active.value = 0
    }
  }, (shown.value.length - 1) * STAGGER_MS + CARD_INTRO_MS)
}

watch(active, () => {
  scheduleNext()
  nextTick(placeFrame)
})

const { visible, target } = useScrollReveal({ threshold: 0.2 })

onMounted(() => {
  reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  desktop = window.matchMedia('(min-width: 64rem)').matches
  if (!reduced && !visible.value) armed.value = true
  window.addEventListener('resize', placeFrame)
})

watch(visible, (isVisible) => {
  if (isVisible && armed.value) startIntro()
})

function pick(index: number) {
  if (!desktop || introRunning.value) return
  picked = true
  auto.value = false
  clearTimeout(cycleTimer)
  active.value = index
}

// Paging swaps in the next six cards and replays their decrypt.
function goTo(next: number) {
  if (next === page.value) return
  page.value = (next + pageCount) % pageCount
  active.value = -1
  if (reduced) return
  armed.value = true
  play.value = false
  nextTick(startIntro)
}

onBeforeUnmount(() => {
  clearTimeout(introTimer)
  clearTimeout(cycleTimer)
  window.removeEventListener('resize', placeFrame)
})

const status = computed(() => {
  if (introRunning.value) return `Decrypting ${pad(shown.value.length)} files…`
  if (active.value < 0) return `${pad(projects.length)} files`
  return `${auto.value ? 'Auto scan' : 'Manual'} · ${pad(page.value * PER_PAGE + active.value + 1)} / ${pad(projects.length)}`
})

// Case study panel.
const openIndex = ref<number | null>(null)
const openProject = computed(() => (openIndex.value === null ? null : projects[openIndex.value]!))

function openCase(index: number) {
  auto.value = false
  picked = true
  clearTimeout(cycleTimer)
  openIndex.value = page.value * PER_PAGE + index
}
</script>

<template>
  <div class="relative overflow-hidden py-20 sm:py-24">
    <BackgroundsBlueprintBackground />

    <div :ref="el => target(el as Element | null)" class="section-container relative">
      <div class="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div class="grid gap-4">
          <SectionTitle text="Projects" />
          <p class="max-w-2xl text-(--color-text-muted)">
            Things I've built for clients and for myself. Every one has a case study; the public ones are live too.
          </p>
        </div>
        <span class="hidden items-center gap-2 font-hud text-sm font-semibold uppercase tracking-[0.14em] text-(--color-text-muted) lg:flex" aria-hidden="true">
          <span class="status-dot size-[7px]" :class="auto || introRunning ? 'bg-(--color-primary-light)' : 'bg-(--color-secondary)'" />
          {{ status }}
        </span>
      </div>

      <div ref="gridEl" class="relative mt-12 grid gap-6 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-8">
        <div
          v-for="(project, index) in shown"
          :key="project.slug"
          data-card
          @mouseenter="pick(index)"
          @focusin="pick(index)"
        >
          <ProjectsProjectCard
            :project="project"
            :armed="armed"
            :play="play"
            :delay="index * STAGGER_MS"
            :active="active === index"
            :muted="active >= 0 && active !== index"
            :cycle-ms="CYCLE_MS"
            :timed="auto"
            @open="openCase(index)"
          />
        </div>

        <span
          class="frame"
          :class="{ 'is-ready': frame.ready && active >= 0 }"
          :style="{ transform: `translate(${frame.x}px, ${frame.y - 12}px)`, width: `${frame.w}px`, height: `${frame.h}px` }"
          aria-hidden="true"
        />
      </div>

      <nav v-if="pageCount > 1" class="mt-12 flex items-center justify-center gap-3" aria-label="Project pages">
        <button type="button" class="page-btn px-3.5" @click="goTo(page - 1)">
          Prev
        </button>
        <button
          v-for="n in pageCount"
          :key="n"
          type="button"
          class="page-btn w-10"
          :class="{ 'is-current': page === n - 1 }"
          :aria-current="page === n - 1 ? 'page' : undefined"
          @click="goTo(n - 1)"
        >
          {{ n }}
        </button>
        <button type="button" class="page-btn px-3.5" @click="goTo(page + 1)">
          Next
        </button>
      </nav>
    </div>

    <ProjectsCaseStudy
      :project="openProject"
      :index="openIndex ?? 0"
      :total="projects.length"
      @close="openIndex = null"
      @next="openIndex = ((openIndex ?? 0) + 1) % projects.length"
    />
  </div>
</template>

<style scoped>
/* One frame glides between cards and rises with the selected one. */
.frame {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 3;
  border: 2px solid var(--color-primary);
  box-shadow:
    0 0 0 4px color-mix(in srgb, var(--color-primary) 12%, transparent),
    0 0 28px color-mix(in srgb, var(--color-primary) 35%, transparent);
  opacity: 0;
  pointer-events: none;
  transition:
    transform 0.55s cubic-bezier(0.65, 0, 0.2, 1),
    width 0.55s cubic-bezier(0.65, 0, 0.2, 1),
    height 0.55s cubic-bezier(0.65, 0, 0.2, 1),
    opacity 0.3s;
}

.frame.is-ready {
  opacity: 1;
}

.status-dot {
  animation: pulse 1.2s ease-in-out infinite;
}

@keyframes pulse {
  50% {
    opacity: 0.3;
  }
}

.page-btn {
  height: 40px;
  border: 1px solid color-mix(in srgb, var(--color-secondary) 30%, transparent);
  color: var(--color-text-muted);
  font: 700 15px/1 var(--font-hud);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition:
    border-color 0.2s,
    color 0.2s;
}

.page-btn:hover,
.page-btn:focus-visible {
  border-color: var(--color-primary-light);
  color: var(--color-text);
}

.page-btn.is-current {
  border-color: var(--color-text);
  background: var(--color-text);
  color: var(--color-bg);
}

@media (prefers-reduced-motion: reduce) {
  .frame {
    transition: none;
  }

  .status-dot {
    animation: none;
  }
}
</style>
