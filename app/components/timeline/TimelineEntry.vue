<script setup lang="ts">
interface ExperienceEntry {
  company: string
  role: string
  startDate: string
  endDate: string
  description: string
  tech: string[]
}

defineProps<{
  entry: ExperienceEntry
  isLast: boolean
}>()

const { visible, target } = useScrollReveal()
</script>

<template>
  <div
    :ref="target"
    class="relative flex gap-5 pb-10 transition-all duration-700 ease-out last:pb-0 sm:gap-6"
    :class="visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
  >
    <div class="flex flex-col items-center">
      <span
        class="mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-(--color-primary) bg-(--color-bg) shadow-[0_0_10px_-2px_var(--color-primary)]"
      />
      <span v-if="!isLast" class="mt-1 w-px flex-1 bg-(--color-primary)/25" />
    </div>

    <div class="flex-1 rounded-xl border border-(--color-border) bg-(--color-bg-elevated) p-5 sm:p-6">
      <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 class="font-heading text-lg font-semibold text-(--color-text) sm:text-xl">
          {{ entry.role }}
        </h3>
        <span class="whitespace-nowrap text-sm text-(--color-secondary)">
          {{ formatMonthYear(entry.startDate) }} — {{ formatMonthYear(entry.endDate) }}
        </span>
      </div>
      <p class="mt-1 text-sm font-medium text-(--color-primary)">
        {{ entry.company }}
      </p>
      <p class="mt-3 text-sm leading-relaxed text-(--color-text-muted)">
        {{ entry.description }}
      </p>
      <div class="mt-4 flex flex-wrap gap-2">
        <span
          v-for="tech in entry.tech"
          :key="tech"
          class="rounded-full border border-(--color-border) px-3 py-1 text-xs text-(--color-text-muted)"
        >
          {{ tech }}
        </span>
      </div>
    </div>
  </div>
</template>
