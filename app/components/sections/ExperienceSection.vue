<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import experience from '~~/content/experience.json'
import type { ExperienceRole } from '~/components/experience/RoleCard.vue'

// Roles grouped into year chapters by start date, newest first (the order in experience.json).
const chapters: { year: string, roles: (ExperienceRole & { index: number })[] }[] = []
experience.forEach((role, index) => {
  const year = role.startDate.slice(0, 4)
  let chapter = chapters.find(c => c.year === year)
  if (!chapter) chapters.push(chapter = { year, roles: [] })
  chapter.roles.push({ ...role, index })
})

const root = ref<HTMLElement | null>(null)
const progress = ref<number[]>(chapters.map(() => 0))
const reached = ref<boolean[]>(experience.map(() => false))
const litYear = ref<string | null>(null)

// A rail beside each chapter fills as the reading line (55% down the viewport) passes through it;
// each card activates once the line reaches it.
function update() {
  if (!root.value) return
  const line = window.innerHeight * 0.55

  let lit: string | null = null
  root.value.querySelectorAll<HTMLElement>('[data-rail]').forEach((rail, c) => {
    const rect = rail.getBoundingClientRect()
    progress.value[c] = Math.max(0, Math.min(1, (line - rect.top) / rect.height))
    if (rect.top < line && rect.bottom > line) lit = chapters[c]!.year
  })
  litYear.value = lit
  root.value.querySelectorAll<HTMLElement>('[data-rail-card]').forEach((card, i) => {
    reached.value[i] = card.getBoundingClientRect().top + 30 < line
  })
}

let frame = 0
function onScroll() {
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(update)
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    progress.value = chapters.map(() => 1)
    reached.value = experience.map(() => true)
    return
  }
  update()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
})
</script>

<template>
  <div class="relative py-20 sm:py-24">
    <div class="section-container">
      <SectionTitle text="Experience" />

      <div ref="root" class="mt-12 grid gap-14">
        <div
          v-for="(chapter, c) in chapters"
          :key="chapter.year"
          class="grid gap-5 lg:grid-cols-[300px_1fr] lg:items-start lg:gap-10"
        >
          <p
            class="year font-heading text-[clamp(4rem,12vw,8.5rem)] font-bold leading-[0.85] tracking-[-0.05em] lg:sticky lg:top-24"
            :class="{ 'is-lit': litYear === chapter.year }"
          >
            {{ chapter.year }}
          </p>

          <div data-rail class="rail relative grid gap-4 pl-[26px]" :style="{ '--p': progress[c] }">
            <span class="rail-fill" aria-hidden="true" />
            <ExperienceRoleCard
              v-for="role in chapter.roles"
              :key="`${role.company}-${role.startDate}`"
              data-rail-card
              :entry="role"
              :reached="reached[role.index] ?? false"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.year {
  color: color-mix(in srgb, var(--color-text) 12%, transparent);
  transition: color 0.5s;
}

.year.is-lit {
  color: color-mix(in srgb, var(--color-primary-light) 55%, transparent);
}

/* Track and fill of the progress rail. */
.rail::before,
.rail-fill {
  content: '';
  position: absolute;
  top: 6px;
  left: 5px;
  width: 2px;
}

.rail::before {
  bottom: 6px;
  background: var(--color-border);
}

.rail-fill {
  height: calc(var(--p, 0) * (100% - 12px));
  background: linear-gradient(var(--color-primary-light), var(--color-primary));
  box-shadow: 0 0 10px var(--color-primary);
}

/* Glowing dot at the tip of the fill. */
.rail-fill::after {
  content: '';
  position: absolute;
  bottom: -7px;
  left: 50%;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--color-primary-light);
  box-shadow:
    0 0 0 5px color-mix(in srgb, var(--color-primary) 20%, transparent),
    0 0 16px var(--color-primary);
  transform: translateX(-50%);
}

@media (prefers-reduced-motion: reduce) {
  .year {
    transition: none;
  }
}
</style>
