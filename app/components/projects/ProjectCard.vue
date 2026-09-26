<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Icon } from '@iconify/vue/offline'

const props = defineProps<{
  project: Project
  // Intro: `armed` hides the card behind the decrypt screen, `play` runs the decrypt after `delay` ms.
  armed: boolean
  play: boolean
  delay: number
  // Selector (lg+): the selected card lifts; the others are muted while the selector runs.
  active: boolean
  muted: boolean
  cycleMs: number
  timed: boolean
}>()

const emit = defineEmits<{ open: [] }>()

const BOOT_MS = 700

const tech = computed(() => projectTech(props.project))
const release = computed(() => latestRelease(props.project))

// done → locked (waiting) → boot (progress bar) → reveal (content arrives) → done
const stage = ref<'done' | 'locked' | 'boot' | 'reveal'>('done')
const percent = ref(0)
const title = useDecodeText(() => props.project.title)

let timers: ReturnType<typeof setTimeout>[] = []
let frame = 0

function lock() {
  stage.value = 'locked'
  percent.value = 0
  title.scramble()
}

// Stages run on timers (not animation frames) so the sequence always completes, even if the tab
// was in the background; only the progress counter and the title decode are per-frame cosmetics.
function run() {
  timers.push(setTimeout(() => {
    stage.value = 'boot'
    const start = performance.now()
    const tick = (now: number) => {
      percent.value = Math.max(0, Math.min(100, Math.round(((now - start) / BOOT_MS) * 100)))
      if (percent.value < 100) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    timers.push(setTimeout(() => {
      cancelAnimationFrame(frame)
      percent.value = 100
      stage.value = 'reveal'
      title.decode(500)
    }, BOOT_MS))

    timers.push(setTimeout(() => {
      stage.value = 'done'
      title.reset()
    }, BOOT_MS + 900))
  }, props.delay))
}

onMounted(() => {
  if (props.armed) lock()
  if (props.play) run()
})

watch(() => props.armed, armed => armed && stage.value === 'done' && lock())
watch(() => props.play, play => play && stage.value === 'locked' && run())

onBeforeUnmount(() => {
  timers.forEach(clearTimeout)
  timers = []
  cancelAnimationFrame(frame)
})

const hidden = computed(() => stage.value === 'locked' || stage.value === 'boot')
</script>

<template>
  <article
    class="card relative flex h-full flex-col border border-(--color-border) bg-(--color-bg-elevated)"
    :class="[`is-${stage}`, { 'is-active': active, 'is-muted': muted }]"
  >
    <div class="shot relative aspect-[16/10] overflow-hidden border-b border-(--color-border) bg-(--color-bg)">
      <img
        :src="project.image"
        :alt="`${project.title} preview`"
        loading="lazy"
        class="shot-img size-full object-cover object-top"
      >

      <div v-if="hidden" class="scanlines absolute inset-0 grid place-content-center justify-items-center gap-3 bg-(--color-bg)" aria-hidden="true">
        <span class="font-hud text-sm font-bold uppercase tracking-[0.2em] text-(--color-text-muted)">
          {{ stage === 'boot' ? 'Decrypting' : 'Encrypted' }}
        </span>
        <span class="relative h-1 w-44 bg-(--color-border)">
          <span class="bar absolute inset-y-0 left-0 bg-(--color-primary)" :style="{ width: `${percent}%` }" />
        </span>
        <span class="font-mono text-[11px] tabular-nums text-(--color-primary-light)">{{ percent }}%</span>
      </div>
      <span v-if="stage === 'reveal'" class="flash absolute inset-0" aria-hidden="true" />

      <span
        v-if="!hidden"
        class="status absolute right-3 top-3 flex items-center gap-1.5 bg-(--color-bg)/90 px-2 py-[3px] font-hud text-xs font-bold uppercase tracking-[0.14em]"
        :class="project.status === 'live' ? 'text-(--color-primary-light)' : 'text-(--color-text-muted)'"
      >
        <span class="size-1.5 bg-current" :class="{ 'live-dot': project.status === 'live' }" aria-hidden="true" />
        {{ STATUS_LABEL[project.status] }}
      </span>
    </div>

    <div class="flex grow flex-col gap-3 p-5 sm:p-[22px]">
      <div class="part flex items-center justify-between gap-3 font-hud text-[13px] font-bold uppercase tracking-[0.16em]" style="--k: 0">
        <span class="text-(--color-primary-light)">{{ project.category }}</span>
        <span class="flex shrink-0 items-center gap-1.5 text-(--color-text-muted)">
          <span v-if="release.inProgress" class="live-dot size-1.5 rounded-full bg-(--color-primary-light)" aria-hidden="true" />
          {{ releaseLabel(release) }}
        </span>
      </div>

      <h3 class="font-heading text-[23px] font-bold leading-tight tracking-[-0.02em]" :class="stage === 'done' ? 'text-(--color-text)' : 'text-(--color-primary-light)'">
        <span class="sr-only">{{ project.title }}</span>
        <span aria-hidden="true" class="block truncate">{{ title.shown.value }}</span>
      </h3>

      <p class="part text-sm leading-relaxed text-(--color-text-muted)" style="--k: 1">
        {{ project.summary }}
      </p>

      <ul class="flex flex-wrap gap-1.5" aria-label="Tech stack">
        <li
          v-for="(tool, index) in tech"
          :key="tool.name"
          class="part tool flex items-center gap-1.5 border border-(--color-border) bg-(--color-bg) px-2 py-1 font-mono text-[11px] font-medium text-(--color-text-muted)"
          :style="{ '--brand': tool.brand, '--k': 2 + index * 0.4 }"
        >
          <Icon :icon="tool.icon" class="size-4 shrink-0" aria-hidden="true" />
          {{ tool.name }}
        </li>
      </ul>

      <div class="part mt-auto flex flex-wrap gap-2.5 pt-3" style="--k: 4.5">
        <button type="button" class="case-btn flex h-[46px] grow-[3] basis-[9.5rem] items-center justify-between gap-3 whitespace-nowrap px-4" @click="emit('open')">
          <span class="relative">Case study</span>
          <Icon icon="lucide:arrow-right" class="arrow relative size-[18px] shrink-0" aria-hidden="true" />
        </button>
        <a
          v-if="project.liveUrl"
          :href="project.liveUrl"
          target="_blank"
          rel="noopener"
          class="live-tab flex h-[46px] grow items-center justify-center gap-2 whitespace-nowrap px-3.5"
          :aria-label="`See ${project.title} live (opens in a new tab)`"
        >
          <span class="live-dot size-[7px] rounded-full bg-(--color-primary-light)" aria-hidden="true" />
          Live
          <Icon icon="lucide:arrow-up-right" class="arrow size-3.5" aria-hidden="true" />
        </a>
        <span
          v-else
          class="lock-tab flex h-[46px] grow items-center justify-center gap-2 whitespace-nowrap px-3.5"
          :title="project.status === 'classified' ? 'Client work under NDA: the case study tells the story' : 'No public link yet'"
        >
          <Icon icon="lucide:lock" class="size-3.5" aria-hidden="true" />
          {{ project.lockLabel }}
        </span>
      </div>
    </div>

    <!-- Selector lock-on: brackets snap in each time the card is selected; a timer runs while it cycles. -->
    <template v-if="active">
      <span class="reticle" aria-hidden="true"><i /><i /><i /><i /></span>
      <span v-if="timed" class="timer" :style="{ animationDuration: `${cycleMs}ms` }" aria-hidden="true" />
    </template>
  </article>
</template>

<style scoped>
.card {
  transition:
    transform 0.45s cubic-bezier(0.3, 1.45, 0.5, 1),
    box-shadow 0.35s,
    border-color 0.3s;
}

.card:hover {
  border-color: color-mix(in srgb, var(--color-primary) 45%, transparent);
}

/* The selected card springs up; the selector frame rises with it. */
.card.is-active {
  z-index: 2;
  transform: translateY(-12px);
  box-shadow: 0 26px 50px -12px rgb(0 0 0 / 60%);
}

/* Screenshots never zoom: only their colour changes. */
.shot-img {
  transition: filter 0.4s;
}

.is-muted .shot-img {
  filter: saturate(0.45) brightness(0.78);
}

/* Decrypt screen: scanlines with a slight jitter. */
.scanlines {
  background-image: repeating-linear-gradient(0deg, color-mix(in srgb, var(--color-secondary) 9%, transparent) 0 2px, transparent 2px 4px);
  animation: jitter 0.12s steps(2) infinite;
}

.bar {
  box-shadow: 0 0 10px var(--color-primary);
}

@keyframes jitter {
  50% {
    background-position: 0 2px;
  }
}

/* Reveal: the screenshot wipes in behind a blue flash, then the details follow one by one. */
.is-reveal .shot-img {
  animation: wipe 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.flash {
  background: var(--color-primary-light);
  mix-blend-mode: screen;
  pointer-events: none;
  animation: flash 0.5s ease-out both;
}

@keyframes wipe {
  from {
    clip-path: inset(0 0 100% 0);
  }
}

@keyframes flash {
  from {
    opacity: 0.7;
  }

  to {
    opacity: 0;
  }
}

.is-locked .part,
.is-boot .part {
  opacity: 0;
}

.is-reveal .part {
  animation: rise 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  animation-delay: calc(var(--k) * 90ms + 150ms);
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}

.tool {
  transition:
    border-color 0.3s,
    color 0.3s;
}

.tool:hover {
  border-color: var(--brand);
  color: var(--color-text);
}

/* Case study: an outlined button that floods with blue from the left, arrow sliding forward. */
.case-btn {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--color-primary);
  color: var(--color-primary-light);
  font: 700 16px/1 var(--font-hud);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: color 0.3s;
}

.case-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--color-primary);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s cubic-bezier(0.65, 0, 0.2, 1);
}

.case-btn:hover,
.case-btn:focus-visible {
  color: var(--color-text);
}

.case-btn:hover::before,
.case-btn:focus-visible::before {
  transform: scaleX(1);
}

.case-btn .arrow {
  transition: transform 0.3s cubic-bezier(0.3, 1.5, 0.5, 1);
}

.case-btn:hover .arrow,
.case-btn:focus-visible .arrow {
  transform: translateX(6px);
}

/* Live: a compact tab with a pulsing dot. */
.live-tab,
.lock-tab {
  font: 700 16px/1 var(--font-hud);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.live-tab {
  border: 1px solid color-mix(in srgb, var(--color-text) 30%, transparent);
  color: var(--color-text);
  transition:
    border-color 0.2s,
    color 0.2s,
    background-color 0.2s;
}

.live-tab:hover,
.live-tab:focus-visible {
  border-color: var(--color-primary-light);
  background: color-mix(in srgb, var(--color-primary) 8%, transparent);
  color: var(--color-primary-light);
}

.live-tab .arrow {
  transition: transform 0.25s;
}

.live-tab:hover .arrow,
.live-tab:focus-visible .arrow {
  transform: translate(3px, -3px);
}

/* No public link: a dashed, quiet tab that says why. */
.lock-tab {
  border: 1px dashed color-mix(in srgb, var(--color-secondary) 40%, transparent);
  color: var(--color-text-muted);
  font-size: 14px;
}

.live-dot {
  animation: pulse 1.4s ease-in-out infinite;
}

@keyframes pulse {
  50% {
    opacity: 0.3;
  }
}

/* Lock-on brackets, same as the Expertise selector. */
.reticle {
  position: absolute;
  inset: -8px;
  pointer-events: none;
}

.reticle i {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 0 solid var(--color-primary-light);
  animation: lock-on 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s both;
}

.reticle i:nth-child(1) {
  top: 0;
  left: 0;
  border-top-width: 2px;
  border-left-width: 2px;
  --from: -10px, -10px;
}

.reticle i:nth-child(2) {
  top: 0;
  right: 0;
  border-top-width: 2px;
  border-right-width: 2px;
  --from: 10px, -10px;
}

.reticle i:nth-child(3) {
  bottom: 0;
  left: 0;
  border-bottom-width: 2px;
  border-left-width: 2px;
  --from: -10px, 10px;
}

.reticle i:nth-child(4) {
  right: 0;
  bottom: 0;
  border-right-width: 2px;
  border-bottom-width: 2px;
  --from: 10px, 10px;
}

@keyframes lock-on {
  from {
    opacity: 0;
    transform: translate(var(--from));
  }
}

.timer {
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 3px;
  background: var(--color-primary-light);
  transform-origin: left;
  animation: fill linear both;
}

@keyframes fill {
  from {
    transform: scaleX(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .card,
  .shot-img,
  .case-btn::before,
  .case-btn .arrow {
    transition: none;
  }

  .live-dot,
  .reticle i,
  .timer {
    animation: none;
  }
}
</style>
