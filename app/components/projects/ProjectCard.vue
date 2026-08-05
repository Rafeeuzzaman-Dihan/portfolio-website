<script setup lang="ts">
import { Icon } from '@iconify/vue/offline'

interface Project {
  title: string
  description: string
  image: string
  tech: string[]
  liveUrl: string
  githubUrl: string
  category: string
}

defineProps<{
  project: Project
}>()
</script>

<template>
  <article
    class="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-bg-elevated) transition-colors duration-300 hover:border-(--color-primary)"
  >
    <div class="relative aspect-[16/10] overflow-hidden">
      <img
        :src="project.image"
        :alt="project.title"
        loading="lazy"
        class="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
      >
      <div
        class="absolute inset-0 bg-gradient-to-t from-(--color-bg) via-(--color-bg)/50 to-transparent transition-opacity duration-300 group-hover:opacity-70"
      />
    </div>

    <div class="flex flex-1 flex-col gap-3 p-6">
      <div class="flex items-start justify-between gap-3">
        <h3 class="font-heading text-lg font-semibold text-(--color-text)">
          {{ project.title }}
        </h3>
        <div class="flex shrink-0 items-center gap-2">
          <a
            v-if="project.githubUrl"
            :href="project.githubUrl"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="`${project.title} on GitHub`"
            class="flex h-9 w-9 items-center justify-center rounded-full border border-(--color-border) text-(--color-text-muted) transition-colors hover:border-(--color-primary) hover:text-(--color-primary)"
          >
            <IconsSocialIcon name="github" />
          </a>
          <a
            v-if="project.liveUrl"
            :href="project.liveUrl"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="`${project.title} live site`"
            class="flex h-9 w-9 items-center justify-center rounded-full border border-(--color-border) text-(--color-text-muted) transition-colors hover:border-(--color-primary) hover:text-(--color-primary)"
          >
            <Icon icon="lucide:external-link" class="h-4 w-4" />
          </a>
        </div>
      </div>

      <p class="text-sm leading-relaxed text-(--color-text-muted)">
        {{ project.description }}
      </p>

      <div class="mt-auto flex flex-wrap gap-2 pt-2">
        <span
          v-for="tech in project.tech"
          :key="tech"
          class="rounded-full border border-(--color-border) px-3 py-1 text-xs text-(--color-text-muted)"
        >
          {{ tech }}
        </span>
      </div>
    </div>
  </article>
</template>
