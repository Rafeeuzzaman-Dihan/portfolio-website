<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { Icon } from '@iconify/vue/offline'
import profile from '~~/content/profile.json'

const links = useNavLinks()
const sectionIds = links.map(link => link.href.replace('#', ''))
const RESUME = links.length // the Resume item sits after the section links

const active = ref(0)
const progress = ref(0)
const hovered = ref<number | null>(null)

const dockEl = ref<HTMLElement | null>(null)
const itemEls = ref<HTMLElement[]>([])
const highlight = reactive({ x: 0, w: 0, ready: false })

let ticking = false
let resizeObserver: ResizeObserver | undefined

// Scroll-spy + progress: the active link is the last section whose top has passed 35% of the viewport.
function update() {
  ticking = false
  const y = window.scrollY
  const max = document.documentElement.scrollHeight - window.innerHeight
  progress.value = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0

  const line = window.innerHeight * 0.35
  let index = 0
  sectionIds.forEach((id, i) => {
    const el = document.getElementById(id)
    if (el && el.getBoundingClientRect().top <= line) index = i
  })
  if (max > 0 && y >= max - 4) index = sectionIds.length - 1
  active.value = index
}

function onScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(update)
}

// The highlight tile sits under the active item and slides to whichever item you point at (then back).
function measure() {
  const el = itemEls.value[hovered.value ?? active.value]
  if (!el) return
  highlight.x = el.offsetLeft
  highlight.w = el.offsetWidth
}

const point = (index: number) => (hovered.value = index)
const release = () => (hovered.value = null)

watch([active, hovered], () => nextTick(measure))

onMounted(async () => {
  update()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })

  await nextTick()
  measure()
  if (dockEl.value) {
    resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(dockEl.value)
  }
  document.fonts?.ready.then(measure)
  // Enable the slide only after the first placement, so the tile doesn't fly in from the left.
  requestAnimationFrame(() => {
    highlight.ready = true
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  resizeObserver?.disconnect()
})
</script>

<template>
  <header class="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 flex justify-center px-3 md:top-6 md:bottom-auto lg:top-9">
    <!-- Off-white dock with a soft ring: icons on phones, icon + label from tablet up -->
    <nav
      ref="dockEl"
      data-tone="light"
      aria-label="Primary"
      class="dock pointer-events-auto relative flex w-full max-w-md items-stretch gap-0.5 overflow-hidden rounded-[1.25rem] border border-(--color-border) bg-(--color-bg) p-1.5 md:w-auto md:max-w-none"
      @pointerleave="release"
    >
      <!-- The tile that follows you -->
      <span
        class="hl absolute top-1.5 bottom-1.5 left-0 rounded-[0.9rem] border border-(--color-border) bg-(--color-bg-elevated)"
        :class="{ 'hl-ready': highlight.ready }"
        :style="{ width: `${highlight.w}px`, transform: `translateX(${highlight.x}px)` }"
        aria-hidden="true"
      />

      <a
        v-for="(link, i) in links"
        :key="link.href"
        :ref="el => { if (el) itemEls[i] = el as HTMLElement }"
        :href="link.href"
        :aria-current="active === i ? 'location' : undefined"
        :aria-label="link.label"
        class="item"
        :class="{ on: active === i }"
        :style="{ '--n': i }"
        @pointerenter="point(i)"
        @focus="point(i)"
        @blur="release"
      >
        <Icon :icon="link.icon" class="item-icon" aria-hidden="true" />
        <span class="item-label">{{ link.label }}</span>
      </a>

      <span class="sep" aria-hidden="true" />

      <a
        :ref="el => { if (el) itemEls[RESUME] = el as HTMLElement }"
        :href="profile.resumeUrl"
        target="_blank"
        rel="noopener"
        aria-label="Resume"
        class="item"
        :style="{ '--n': links.length + 1 }"
        @pointerenter="point(RESUME)"
        @focus="point(RESUME)"
        @blur="release"
      >
        <Icon icon="lucide:download" class="item-icon" aria-hidden="true" />
        <span class="item-label">Resume</span>
      </a>

      <!-- Scroll progress along the bottom edge -->
      <span class="progress" :style="{ transform: `scaleX(${progress})` }" aria-hidden="true" />
    </nav>
  </header>
</template>

<style scoped>
/* Soft ring: a hairline border, a pale ring just outside it, and a soft shadow. It drops in with a spring when the page loads. */
.dock {
  box-shadow:
    0 0 0 5px color-mix(in srgb, var(--color-bg-elevated) 55%, transparent),
    0 2px 4px color-mix(in srgb, var(--color-text) 12%, transparent),
    0 12px 22px -8px color-mix(in srgb, var(--color-text) 40%, transparent),
    0 34px 54px -22px color-mix(in srgb, var(--color-text) 65%, transparent);
  animation: drop 0.9s cubic-bezier(0.2, 1.15, 0.3, 1) 0.2s both;
}

@keyframes drop {
  from { opacity: 0; transform: translateY(-120%) scale(0.94); }
}

@keyframes lift {
  from { opacity: 0; transform: translateY(140%) scale(0.94); }
}

@keyframes pop-in {
  from { opacity: 0; transform: translateY(10px); }
}

@media (width < 48rem) {
  .dock { animation-name: lift; }
  .item { animation-name: pop-in; }
}

.hl-ready {
  transition:
    transform 0.5s cubic-bezier(0.3, 1.35, 0.5, 1),
    width 0.5s cubic-bezier(0.3, 1.35, 0.5, 1);
}

.item {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-width: 0;
  padding: 0.6rem 0.25rem;
  color: var(--color-text-muted);
  text-decoration: none;
  border-radius: 0.9rem;
  transition: color 0.2s;
  animation: rise 0.55s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  animation-delay: calc(0.45s + var(--n) * 60ms);
}

/* From tablet up the icon sits beside its label, which keeps the dock slim */
@media (width >= 48rem) {
  .item {
    flex: none;
    padding: 0.6rem 0.8rem;
  }
}

@keyframes rise {
  from { opacity: 0; transform: translateY(-10px); }
}

.item:hover,
.item:focus-visible {
  color: var(--color-primary);
}

.item:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

.item.on {
  color: var(--color-text);
}

.item-icon {
  flex: none;
  width: 1.3rem;
  height: 1.3rem;
  transition: color 0.2s;
}

.item.on .item-icon {
  color: var(--color-primary);
}

/* Labels: always shown from tablet up, icon only on phones */
.item-label {
  display: none;
  font: 600 0.8125rem / 1.1 var(--font-body);
  letter-spacing: 0.01em;
}

@media (width >= 48rem) {
  .item-label {
    display: block;
  }
}

/* A dark-red dot marks the section you are in */
.item.on::after {
  content: '';
  position: absolute;
  top: 0.3rem;
  right: 0.4rem;
  width: 0.3125rem;
  height: 0.3125rem;
  background: var(--color-warm);
  border-radius: 50%;
  animation: pip 0.5s cubic-bezier(0.3, 1.8, 0.5, 1) both;
}

@keyframes pip {
  from { transform: scale(0); }
}

.sep {
  align-self: center;
  flex: none;
  width: 2px;
  height: 1.6rem;
  margin: 0 0.3rem;
  background: color-mix(in srgb, var(--color-text) 28%, transparent);
  border-radius: 1px;
}

.progress {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 2px;
  background: var(--color-primary);
  transform-origin: left;
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .dock, .item, .item.on::after { animation: none; }
  .hl-ready, .item, .item-icon { transition: none; }
}
</style>
