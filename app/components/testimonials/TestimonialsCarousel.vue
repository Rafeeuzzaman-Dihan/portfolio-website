<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import testimonials from '~~/content/testimonials.json'

const NOTE_MS = 5000

const pad = (n: number) => String(n).padStart(2, '0')
// Clients are shown as initials in a square, never a photo.
const initials = (name: string) => name.split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase()

const notes = testimonials.map(t => ({ ...t, initials: initials(t.name), words: t.quote.split(/\s+/) }))

const active = ref(0)
const counter = computed(() => pad(active.value + 1))

// The notes advance by themselves once on screen; a click on a client takes over for that note.
let timer: ReturnType<typeof setTimeout> | undefined
let reduced = false
const running = ref(false)

function schedule() {
  clearTimeout(timer)
  if (running.value) timer = setTimeout(() => (active.value = (active.value + 1) % notes.length), NOTE_MS)
}

watch(active, schedule)

function pick(index: number) {
  active.value = index
  schedule()
}

const { visible, target } = useScrollReveal({ threshold: 0.3 })

watch(visible, (isVisible) => {
  if (isVisible && !reduced) {
    running.value = true
    schedule()
  }
})

onMounted(() => (reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches))
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div :ref="el => target(el as Element | null)" :style="{ '--note-ms': `${NOTE_MS}ms` }">
    <div class="flex items-center justify-between gap-4">
      <span class="label flex items-center gap-2.5">
        <span class="size-1.5 bg-(--color-primary)" aria-hidden="true" />Client notes
      </span>
      <span class="label"><b class="font-medium text-(--color-text)">{{ counter }}</b> / {{ pad(notes.length) }}</span>
    </div>

    <!-- Clients: square monogram tabs (no photos), each with its own timer line -->
    <div class="mt-6 grid grid-cols-4 gap-2.5" role="tablist" aria-label="Client notes">
      <button
        v-for="(note, index) in notes"
        :id="`note-tab-${index}`"
        :key="note.name"
        type="button"
        role="tab"
        class="tab"
        :class="{ on: active === index, done: active > index }"
        :aria-selected="active === index"
        :aria-controls="`note-${index}`"
        @click="pick(index)"
      >
        <span class="msq">{{ note.initials }}</span>
        <span class="tt hidden min-w-0 lg:block">
          <span class="block font-heading text-[0.92rem] leading-tight font-semibold text-(--color-text)">{{ note.name }}</span>
          <span class="mt-[3px] block text-[0.74rem] leading-[1.3] text-(--color-secondary)">{{ note.role }}</span>
        </span>
        <i />
      </button>
    </div>

    <!-- The quote: big, and it appears word by word -->
    <div class="relative mt-12 grid">
      <span class="qm" aria-hidden="true">“</span>
      <figure
        v-for="(note, index) in notes"
        :id="`note-${index}`"
        :key="note.name"
        class="q"
        :class="{ on: active === index }"
        role="tabpanel"
        :aria-labelledby="`note-tab-${index}`"
        :aria-hidden="active !== index"
      >
        <blockquote :aria-label="note.quote">
          <span v-for="(word, n) in note.words" :key="n" class="w" aria-hidden="true" :style="{ '--n': n }">{{ word }}&nbsp;</span>
        </blockquote>
        <figcaption>
          <span class="font-heading text-base font-semibold text-(--color-text)">{{ note.name }}</span>
          <span class="text-[0.88rem] text-(--color-secondary)">{{ note.role }}</span>
        </figcaption>
      </figure>
    </div>
  </div>
</template>

<style scoped>
.label {
  font: 500 10px/1 var(--font-mono);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-secondary);
}

.tab {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 10px;
  text-align: left;
  cursor: pointer;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  opacity: 0.5;
  transition: opacity 0.3s, border-color 0.3s, box-shadow 0.3s, translate 0.3s;
}

@media (width >= 64rem) {
  .tab { padding: 12px; }
}

.tab:hover { opacity: 0.85; }

.tab.on {
  opacity: 1;
  border-color: color-mix(in srgb, var(--color-primary) 55%, transparent);
  box-shadow: 0 0 26px -12px var(--color-primary);
  translate: 0 -3px;
}

.tab:focus-visible { outline: 2px solid var(--color-primary-light); outline-offset: 3px; }

.msq {
  display: grid;
  flex: none;
  place-items: center;
  width: 40px;
  height: 40px;
  font: 600 13px var(--font-mono);
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  transition: color 0.3s, border-color 0.3s;
}

.tab.on .msq { color: var(--color-primary-light); border-color: var(--color-primary); }

.tab i {
  position: absolute;
  bottom: -1px;
  left: -1px;
  width: 0;
  height: 2px;
  background: var(--color-primary);
  box-shadow: 0 0 8px var(--color-primary);
}

.tab.done i { width: calc(100% + 2px); opacity: 0.4; }
.tab.on i { animation: timer var(--note-ms, 5s) linear forwards; }

@keyframes timer {
  to { width: calc(100% + 2px); }
}

.qm {
  position: absolute;
  top: -58px;
  left: -6px;
  font: 700 clamp(7rem, 14vw, 11rem) / 1 var(--font-heading);
  color: transparent;
  pointer-events: none;
  user-select: none;
  -webkit-text-stroke: 1px color-mix(in srgb, var(--color-primary) 45%, transparent);
}

.q { position: relative; grid-area: 1 / 1; margin: 0; visibility: hidden; }
.q.on { visibility: visible; }

.q blockquote {
  max-width: 62rem;
  margin: 0;
  font: 600 clamp(1.5rem, 3.4vw, 2.6rem) / 1.22 var(--font-heading);
  letter-spacing: -0.03em;
  text-wrap: balance;
  color: var(--color-text);
}

.w { display: inline-block; opacity: 0; }

.q.on .w {
  animation: word 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  animation-delay: calc(var(--n) * 30ms);
}

@keyframes word {
  from { opacity: 0; transform: translateY(0.45em); filter: blur(6px); }
  to { opacity: 1; transform: none; filter: none; }
}

.q figcaption {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 14px;
  margin-top: 26px;
  opacity: 0;
}

.q.on figcaption { animation: caption 0.5s ease 0.55s both; }

@keyframes caption {
  to { opacity: 1; }
}

.q figcaption::before { content: ''; width: 28px; height: 2px; background: var(--color-primary); }

/* Reduced motion: no timers, the quote is simply there */
@media (prefers-reduced-motion: reduce) {
  .tab, .msq { transition: none; }
  .tab.on i { animation: none; width: calc(100% + 2px); }
  .q.on .w { animation: none; opacity: 1; }
  .q.on figcaption { animation: none; opacity: 1; }
}
</style>
