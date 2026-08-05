<script setup lang="ts">
import projects from '~~/content/projects.json'

const categories = computed(() => ['All', ...new Set(projects.map(project => project.category))])
const activeCategory = ref('All')

const filteredProjects = computed(() =>
  activeCategory.value === 'All'
    ? projects
    : projects.filter(project => project.category === activeCategory.value)
)
</script>

<template>
  <div class="relative py-20 sm:py-24">
    <div class="section-container">
      <h2 class="font-heading text-3xl font-bold text-(--color-text) sm:text-4xl">
        Projects
      </h2>
      <p class="mt-2 max-w-2xl text-(--color-text-muted)">
        A selection of things I've designed, built, and shipped.
      </p>

      <div class="mt-8 flex flex-wrap gap-3">
        <button
          v-for="category in categories"
          :key="category"
          type="button"
          class="rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200"
          :class="activeCategory === category
            ? 'border-(--color-primary) bg-(--color-primary) text-(--color-text)'
            : 'border-(--color-border) text-(--color-text-muted) hover:border-(--color-primary) hover:text-(--color-primary)'"
          @click="activeCategory = category"
        >
          {{ category }}
        </button>
      </div>

      <!-- Mobile: floating sticky-stack cards -->
      <TransitionGroup
        tag="div"
        class="mt-10 flex flex-col gap-6 sm:hidden"
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
        move-class="transition-transform duration-300 ease-out"
      >
        <div
          v-for="(project, index) in filteredProjects"
          :key="project.title"
          class="sticky pb-6"
          :style="{ top: `${72 + index * 14}px`, zIndex: index + 1 }"
        >
          <ProjectsProjectCard :project="project" class="shadow-xl shadow-black/30" />
        </div>
      </TransitionGroup>

      <!-- Tablet/desktop: responsive grid -->
      <TransitionGroup
        tag="div"
        class="mt-10 hidden gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-3"
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
        move-class="transition-transform duration-300 ease-out"
      >
        <ProjectsProjectCard
          v-for="project in filteredProjects"
          :key="project.title"
          :project="project"
        />
      </TransitionGroup>
    </div>
  </div>
</template>
