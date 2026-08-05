<script setup lang="ts">
import profile from '~~/content/profile.json'

const { currentWord } = useRotatingText(profile.roles, 2200)
</script>

<template>
  <div class="relative flex min-h-screen flex-col justify-center overflow-hidden py-24">
    <BackgroundsDotGridBackground />

    <div class="section-container relative flex flex-col gap-6">
      <h1
        class="font-heading text-4xl font-bold leading-tight text-(--color-text) sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
      >
        {{ profile.name }}
      </h1>

      <p
        class="flex flex-wrap items-baseline gap-x-3 font-heading text-xl font-medium text-(--color-text-muted) sm:text-2xl md:text-3xl lg:text-4xl"
      >
        <span>{{ profile.rolePrefix }}</span>
        <Transition
          mode="out-in"
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <span :key="currentWord" class="inline-block text-(--color-primary)">{{ currentWord }}</span>
        </Transition>
      </p>

      <p class="max-w-2xl text-base text-(--color-text-muted) sm:text-lg">
        {{ profile.bio }}
      </p>

      <div class="flex flex-col gap-4 pt-2 sm:flex-row">
        <a
          href="#projects"
          class="inline-flex w-full items-center justify-center rounded-md bg-(--color-primary) px-6 py-3 text-sm font-semibold text-(--color-text) transition-colors hover:bg-(--color-primary-light) sm:w-auto"
        >
          View Work
        </a>
        <a
          href="#contact"
          class="inline-flex w-full items-center justify-center rounded-md border border-(--color-primary) px-6 py-3 text-sm font-semibold text-(--color-primary) transition-colors hover:bg-(--color-primary)/10 sm:w-auto"
        >
          Contact Me
        </a>
      </div>
    </div>
  </div>
</template>
