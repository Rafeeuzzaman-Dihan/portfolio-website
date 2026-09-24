<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { Icon } from '@iconify/vue/offline'
import expertise from '~~/content/expertise.json'
import skillGroups from '~~/content/skills.json'

const CYCLE_MS = 3500

// Tools are named in expertise.json; their logo and brand colour come from skills.json.
const skillsByName = new Map(skillGroups.flatMap(group => group.skills).map(skill => [skill.name, skill]))
const areas = expertise.areas.map(area => ({
  ...area,
  tools: area.tools.map((name) => {
    const skill = skillsByName.get(name)
    if (!skill) throw new Error(`expertise.json: "${name}" is not in skills.json`)
    return skill
  })
}))

const active = ref(0)
const current = computed(() => areas[active.value]!)
const counter = computed(() => `${String(active.value + 1).padStart(2, '0')} / ${String(areas.length).padStart(2, '0')}`)

// Areas cycle by themselves (desktop only, once the section is on screen) until the visitor picks one.
const auto = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

function scheduleNext() {
  clearTimeout(timer)
  if (auto.value) timer = setTimeout(() => (active.value = (active.value + 1) % areas.length), CYCLE_MS)
}

watch(active, scheduleNext)

function pick(index: number) {
  auto.value = false
  clearTimeout(timer)
  active.value = index
}

const { visible, target } = useScrollReveal({ threshold: 0.4 })

watch(visible, (isVisible) => {
  const desktop = window.matchMedia('(min-width: 64rem)').matches
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (isVisible && desktop && !reduced) {
    auto.value = true
    scheduleNext()
  }
})

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div :ref="el => target(el as Element | null)">
    <!-- Desktop: pick an area on the left, its tools load into the panel on the right. -->
    <div class="hidden grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-6 lg:grid">
      <div class="grid content-start gap-3" role="tablist" aria-label="Expertise areas">
        <button
          v-for="(area, index) in areas"
          :id="`expertise-tab-${index}`"
          :key="area.title"
          type="button"
          role="tab"
          :aria-selected="active === index"
          aria-controls="expertise-panel"
          class="pick group relative flex w-full cursor-pointer items-center gap-3.5 rounded-xl border border-(--color-border) px-5 py-[18px] text-left text-(--color-text-muted) transition-colors hover:text-(--color-text) aria-selected:border-(--color-primary)/55 aria-selected:bg-(--color-bg-elevated) aria-selected:text-(--color-text)"
          @mouseenter="pick(index)"
          @focus="pick(index)"
          @click="pick(index)"
        >
          <span class="reticle" aria-hidden="true"><i /><i /><i /><i /></span>
          <Icon :icon="area.icon" class="size-[26px] shrink-0 text-(--color-secondary) transition-colors group-aria-selected:text-(--color-primary-light)" aria-hidden="true" />
          <span class="font-heading text-lg font-semibold leading-tight tracking-[-0.015em]">{{ area.title }}</span>
          <span class="ml-auto -translate-x-2 text-(--color-primary-light) opacity-0 transition duration-300 group-aria-selected:translate-x-0 group-aria-selected:opacity-100" aria-hidden="true">→</span>
          <span v-if="auto && active === index" :key="`timer-${active}`" class="timer" :style="{ animationDuration: `${CYCLE_MS}ms` }" aria-hidden="true" />
        </button>
      </div>

      <div
        id="expertise-panel"
        role="tabpanel"
        :aria-labelledby="`expertise-tab-${active}`"
        class="panel relative flex min-h-full flex-col gap-3.5 overflow-hidden rounded-[14px] border border-(--color-border) bg-(--color-bg-elevated) px-8 py-8"
      >
        <Icon :key="`bg-${active}`" :icon="current.icon" class="swap pointer-events-none absolute -bottom-8 -right-8 size-56 text-(--color-primary) opacity-[0.06]" aria-hidden="true" />

        <div class="flex justify-between font-mono text-[11px] font-medium uppercase leading-none tracking-[0.14em] text-(--color-secondary)">
          <span>Loadout</span>
          <span class="text-(--color-primary-light)">{{ counter }}</span>
        </div>

        <div :key="`text-${active}`" class="swap mt-2 grid gap-3.5">
          <h3 class="font-heading text-[clamp(1.75rem,3.2vw,2.5rem)] font-bold leading-[1.1] tracking-[-0.03em] text-(--color-text)">
            {{ current.title }}
          </h3>
          <p class="font-heading text-lg font-medium text-(--color-text-muted)">
            {{ current.tagline }}
          </p>
        </div>

        <ul :key="`tools-${active}`" class="mt-auto grid grid-cols-3 gap-3 pt-5">
          <li
            v-for="(tool, index) in current.tools"
            :key="tool.name"
            class="tool flex items-center gap-3 rounded-xl border border-(--color-border) bg-(--color-bg) px-3.5 py-3 font-mono text-xs font-medium text-(--color-text-muted)"
            :style="{ '--brand': tool.brand, '--i': index }"
          >
            <Icon :icon="tool.icon" class="size-[26px] shrink-0" aria-hidden="true" />
            {{ tool.name }}
          </li>
        </ul>
      </div>
    </div>

    <!-- Below lg: every area as a card with its tools. -->
    <div class="grid gap-4 sm:grid-cols-2 lg:hidden">
      <article
        v-for="area in areas"
        :key="area.title"
        class="flex flex-col gap-3 rounded-xl border border-(--color-border) bg-(--color-bg-elevated) p-5 sm:last:odd:col-span-2"
      >
        <div class="flex items-center gap-3.5">
          <Icon :icon="area.icon" class="size-[26px] shrink-0 text-(--color-primary-light)" aria-hidden="true" />
          <h3 class="font-heading text-lg font-semibold leading-tight tracking-[-0.015em] text-(--color-text)">
            {{ area.title }}
          </h3>
        </div>
        <p class="font-heading font-medium text-(--color-text-muted)">
          {{ area.tagline }}
        </p>
        <ul class="mt-auto flex flex-wrap gap-2 pt-1">
          <li
            v-for="tool in area.tools"
            :key="tool.name"
            class="grid size-11 place-items-center rounded-[10px] border border-(--color-border) bg-(--color-bg)"
            :title="tool.name"
          >
            <Icon :icon="tool.icon" class="size-6" aria-hidden="true" />
            <span class="sr-only">{{ tool.name }}</span>
          </li>
        </ul>
      </article>
    </div>
  </div>
</template>

<style scoped>
/* Corner brackets snap onto the selected area. */
.reticle {
  position: absolute;
  inset: -6px;
  pointer-events: none;
}

.reticle i {
  position: absolute;
  width: 14px;
  height: 14px;
  border: 0 solid var(--color-primary);
  opacity: 0;
  transition:
    transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 0.15s;
}

.reticle i:nth-child(1) {
  top: 0;
  left: 0;
  border-top-width: 2px;
  border-left-width: 2px;
  transform: translate(-10px, -10px);
}

.reticle i:nth-child(2) {
  top: 0;
  right: 0;
  border-top-width: 2px;
  border-right-width: 2px;
  transform: translate(10px, -10px);
}

.reticle i:nth-child(3) {
  bottom: 0;
  left: 0;
  border-bottom-width: 2px;
  border-left-width: 2px;
  transform: translate(-10px, 10px);
}

.reticle i:nth-child(4) {
  right: 0;
  bottom: 0;
  border-right-width: 2px;
  border-bottom-width: 2px;
  transform: translate(10px, 10px);
}

.pick[aria-selected='true'] .reticle i {
  opacity: 1;
  transform: none;
}

/* Timer bar along the selected area while the loadout cycles. */
.timer {
  position: absolute;
  right: 20px;
  bottom: -1px;
  left: 20px;
  height: 2px;
  background: var(--color-primary);
  transform-origin: left;
  animation: fill linear both;
}

@keyframes fill {
  from {
    transform: scaleX(0);
  }
}

/* HUD corner marks on the panel. */
.panel::before {
  --c: var(--color-primary);
  content: '';
  position: absolute;
  inset: 10px;
  opacity: 0.7;
  pointer-events: none;
  background:
    linear-gradient(var(--c), var(--c)) top left / 14px 1px no-repeat,
    linear-gradient(var(--c), var(--c)) top left / 1px 14px no-repeat,
    linear-gradient(var(--c), var(--c)) top right / 14px 1px no-repeat,
    linear-gradient(var(--c), var(--c)) top right / 1px 14px no-repeat,
    linear-gradient(var(--c), var(--c)) bottom left / 14px 1px no-repeat,
    linear-gradient(var(--c), var(--c)) bottom left / 1px 14px no-repeat,
    linear-gradient(var(--c), var(--c)) bottom right / 14px 1px no-repeat,
    linear-gradient(var(--c), var(--c)) bottom right / 1px 14px no-repeat;
}

/* Quick swap: text rises in, tools fly in one after another. */
.swap {
  animation: rise 0.28s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.tool {
  animation: fly-in 0.32s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  animation-delay: calc(var(--i) * 40ms + 40ms);
  transition:
    border-color 0.3s,
    color 0.3s;
}

.tool:hover {
  border-color: var(--brand);
  color: var(--color-text);
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
}

@keyframes fly-in {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.9);
  }
}

@media (prefers-reduced-motion: reduce) {
  .swap,
  .tool {
    animation: none;
  }

  .reticle i {
    transition: none;
  }
}
</style>
