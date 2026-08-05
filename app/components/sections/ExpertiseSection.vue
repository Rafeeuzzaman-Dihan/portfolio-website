<script setup lang="ts">
import { Icon } from '@iconify/vue/offline'
import expertiseItems from '~~/content/expertise.json'
import skillGroups from '~~/content/skills.json'
</script>

<template>
  <div class="relative overflow-hidden py-20 sm:py-24">
    <BackgroundsDotGridBackground />

    <div class="section-container relative flex flex-col gap-16">
      <div>
        <h2 class="font-heading text-3xl font-bold text-(--color-text) sm:text-4xl">
          Expertise
        </h2>
        <p class="mt-2 max-w-2xl text-(--color-text-muted)">
          The core areas I focus on when building a product end-to-end.
        </p>

        <div class="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div
            v-for="item in expertiseItems"
            :key="item.title"
            class="flex flex-col gap-4 rounded-xl border border-(--color-border) bg-(--color-bg-elevated) p-6 transition-all duration-300 hover:-translate-y-1 hover:border-(--color-primary) hover:shadow-[0_0_24px_-4px_var(--color-primary)]"
          >
            <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-(--color-primary)/10 text-(--color-primary)">
              <Icon :icon="`lucide:${item.icon}`" class="h-6 w-6" />
            </div>
            <h3 class="font-heading text-lg font-semibold text-(--color-text)">
              {{ item.title }}
            </h3>
            <p class="text-sm leading-relaxed text-(--color-text-muted)">
              {{ item.description }}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 class="font-heading text-2xl font-bold text-(--color-text) sm:text-3xl">
          Skills
        </h2>

        <div class="mt-8 grid grid-cols-1 gap-x-12 gap-y-8 sm:grid-cols-2">
          <div v-for="group in skillGroups" :key="group.category">
            <h3 class="font-heading text-sm font-semibold uppercase tracking-wide text-(--color-secondary)">
              {{ group.category }}
            </h3>
            <div class="mt-4 flex flex-wrap gap-2">
              <span
                v-for="skill in group.skills"
                :key="skill"
                class="rounded-full border border-(--color-border) bg-(--color-bg-elevated) px-4 py-1.5 text-sm text-(--color-text-muted) transition-colors hover:border-(--color-primary) hover:text-(--color-primary)"
              >
                {{ skill }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
