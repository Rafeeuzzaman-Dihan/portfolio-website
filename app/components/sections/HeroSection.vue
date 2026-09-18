<script setup lang="ts">
import profile from '~~/content/profile.json'
import type { Role } from '~/composables/useRoleTransition'

const roles = profile.roles as Role[]
const firstName = profile.name.replace(new RegExp(`\\s*${profile.nickname}$`), '')
</script>

<template>
  <div class="relative flex min-h-screen flex-col overflow-hidden pb-8 pt-24 md:pb-14">
    <BackgroundsDotGridBackground />

    <!-- HUD corner marks, kept clear of the fixed header -->
    <div class="pointer-events-none" aria-hidden="true">
      <span class="absolute left-3 top-20 size-5 border-l border-t border-(--color-secondary)/45 sm:left-7 sm:top-24 sm:size-7" />
      <span class="absolute right-3 top-20 size-5 border-r border-t border-(--color-secondary)/45 sm:right-7 sm:top-24 sm:size-7" />
      <span class="absolute bottom-3 left-3 size-5 border-b border-l border-(--color-secondary)/45 sm:bottom-7 sm:left-7 sm:size-7" />
      <span class="absolute bottom-3 right-3 size-5 border-b border-r border-(--color-secondary)/45 sm:bottom-7 sm:right-7 sm:size-7" />
    </div>

    <div class="relative flex flex-1 items-center">
      <div class="section-container flex flex-col">
        <p class="flex items-center gap-3 font-heading text-lg font-medium leading-[1.2] text-(--color-text-muted) sm:text-xl lg:text-2xl">
          <span class="h-px w-7 bg-(--color-primary) sm:w-9" aria-hidden="true" />
          {{ profile.greeting }}
        </p>

        <h1
          class="mt-3 font-heading text-[2.75rem] font-bold leading-none tracking-[-0.035em] text-(--color-text) sm:text-6xl md:text-7xl lg:text-8xl xl:text-[7.25rem]"
        >
          {{ firstName }} <span class="text-(--color-primary)">{{ profile.nickname }}</span>
        </h1>

        <RotatingRole
          :prefix="profile.rolePrefix"
          :roles="roles"
          class="mt-8 font-heading text-3xl font-medium sm:mt-8 sm:text-4xl lg:mt-10 lg:text-5xl"
        />

        <p class="mt-6 max-w-2xl text-base leading-relaxed text-(--color-text-muted) sm:text-lg md:mt-9">
          {{ profile.bio }}
        </p>

        <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-4 md:mt-8">
          <a
            href="#projects"
            class="inline-flex h-12 w-full items-center justify-center rounded-md bg-(--color-primary) px-7 text-sm font-semibold text-(--color-bg) transition-colors hover:bg-(--color-primary-light) sm:w-auto"
          >
            View Work
          </a>
          <a
            href="#contact"
            class="inline-flex h-12 w-full items-center justify-center rounded-md border border-(--color-primary) px-7 text-sm font-semibold text-(--color-primary-light) transition-colors hover:bg-(--color-primary)/10 sm:w-auto"
          >
            Contact Me
          </a>
        </div>
      </div>
    </div>

    <ScrollIndicator target="#expertise" class="relative mx-auto mt-10" />
  </div>
</template>
