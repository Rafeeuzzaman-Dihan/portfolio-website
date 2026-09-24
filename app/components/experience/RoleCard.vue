<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { Icon } from '@iconify/vue/offline'

export interface ExperienceRole {
  role: string
  company: string
  city: string
  mode: string
  startDate: string
  endDate: string
  points: string[]
}

const props = defineProps<{
  entry: ExperienceRole
  reached: boolean
}>()

const months = computed(() => monthsBetween(props.entry.startDate, props.entry.endDate))
const isCurrent = computed(() => props.entry.endDate === 'Present')

// The duration counts up from 0 the first time the progress rail reaches this card.
const shown = ref(months.value)
let frame = 0
let counted = false

watch(() => props.reached, (reached) => {
  if (!reached || counted) return
  counted = true
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const start = performance.now()
  const tick = (now: number) => {
    const progress = Math.min(1, (now - start) / 600)
    shown.value = Math.round(progress * months.value)
    if (progress < 1) frame = requestAnimationFrame(tick)
  }
  frame = requestAnimationFrame(tick)
})

onBeforeUnmount(() => cancelAnimationFrame(frame))
</script>

<template>
  <article class="role-card relative grid gap-4 rounded-r-[14px] border-l-2 border-transparent px-6 py-6 sm:px-[26px]" :class="{ 'is-reached': reached }">
    <div class="flex flex-wrap items-start justify-between gap-x-5 gap-y-3">
      <div>
        <h3 class="font-heading text-[clamp(20px,2.1vw,24px)] font-semibold leading-tight tracking-[-0.02em] text-(--color-text)">
          {{ entry.role }}
        </h3>
        <p class="mt-1.5 font-heading font-semibold leading-snug text-(--color-primary-light)">
          {{ entry.company }}
        </p>
      </div>

      <span class="duration inline-flex items-center gap-2 whitespace-nowrap rounded-[10px] bg-(--color-primary) px-3.5 py-2.5 font-heading text-sm font-bold leading-none text-(--color-bg)">
        <Icon icon="lucide:clock" class="size-4" aria-hidden="true" />
        <span aria-hidden="true"><span class="tabular-nums">{{ shown }}</span> {{ months === 1 ? 'Month' : 'Months' }}</span>
        <span class="sr-only">{{ months }} {{ months === 1 ? 'month' : 'months' }}</span>
      </span>
    </div>

    <ul class="flex flex-wrap gap-2">
      <li class="fact" style="--k: 0">
        <Icon icon="lucide:calendar" class="size-4 text-(--color-primary-light)" aria-hidden="true" />
        {{ formatMonthYear(entry.startDate) }} –
        <span v-if="isCurrent" class="inline-flex items-center gap-1.5 text-(--color-primary-light)">
          <span class="live-dot" aria-hidden="true" />Present
        </span>
        <template v-else>
          {{ formatMonthYear(entry.endDate) }}
        </template>
      </li>
      <li class="fact" style="--k: 1">
        <Icon icon="lucide:map-pin" class="size-4 text-(--color-primary-light)" aria-hidden="true" />
        {{ entry.city }}
      </li>
      <li class="fact is-mode" style="--k: 2">
        <Icon :icon="entry.mode === 'Remote' ? 'lucide:globe' : 'lucide:monitor'" class="size-4" aria-hidden="true" />
        {{ entry.mode }}
      </li>
    </ul>

    <ul class="grid gap-2">
      <li
        v-for="point in entry.points"
        :key="point"
        class="relative pl-[18px] text-[15px] leading-relaxed text-(--color-text-muted) before:absolute before:left-0.5 before:top-[0.62em] before:size-1.5 before:rotate-45 before:bg-(--color-primary)"
      >
        {{ point }}
      </li>
    </ul>
  </article>
</template>

<style scoped>
.role-card {
  background: linear-gradient(90deg, var(--color-bg-elevated), color-mix(in srgb, var(--color-bg-elevated) 30%, transparent));
  opacity: 0.5;
  transition:
    opacity 0.5s,
    background-color 0.4s;
}

.role-card.is-reached {
  opacity: 1;
}

/*
 * Node on the progress rail; lights up once the rail reaches the card.
 * The rail's centre sits 6px from the list's left edge; the card's padding box starts 28px in
 * (26px list padding + 2px card border), so a 12px node at -28px is centred on the rail.
 */
.role-card::before {
  content: '';
  position: absolute;
  top: 30px;
  left: -28px;
  width: 12px;
  height: 12px;
  border: 2px solid color-mix(in srgb, var(--color-secondary) 40%, transparent);
  border-radius: 50%;
  background: var(--color-bg);
  transition:
    border-color 0.3s,
    background-color 0.3s;
}

.role-card.is-reached::before {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.duration {
  box-shadow: 0 8px 22px -12px var(--color-primary);
  filter: grayscale(1) brightness(0.7);
  transition: filter 0.4s;
}

.is-reached .duration {
  filter: none;
  animation: pop 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.fact {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-bg);
  color: var(--color-text);
  font-size: 14px;
  font-weight: 500;
  opacity: 0.6;
  transform: scale(0.94);
  transition:
    opacity 0.4s,
    transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  transition-delay: calc(var(--k) * 60ms);
}

.is-reached .fact {
  opacity: 1;
  transform: none;
}

.fact.is-mode {
  border-color: color-mix(in srgb, var(--color-primary) 35%, transparent);
  background: color-mix(in srgb, var(--color-primary) 8%, transparent);
  color: var(--color-primary-light);
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary-light);
  animation: pulse 1.8s infinite;
}

@keyframes pop {
  50% {
    transform: scale(1.08);
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-primary-light) 70%, transparent);
  }

  70%,
  100% {
    box-shadow: 0 0 0 8px transparent;
  }
}

@media (prefers-reduced-motion: reduce) {
  .role-card,
  .role-card::before,
  .duration,
  .fact {
    transition: none;
  }

  .is-reached .duration,
  .live-dot {
    animation: none;
  }
}
</style>
