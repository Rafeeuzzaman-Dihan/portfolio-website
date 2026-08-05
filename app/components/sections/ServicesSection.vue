<script setup lang="ts">
import { Icon } from '@iconify/vue/offline'
import services from '~~/content/services.json'
</script>

<template>
  <div class="relative py-20 sm:py-24">
    <div class="section-container">
      <h2 class="font-heading text-3xl font-bold text-(--color-text) sm:text-4xl">
        Services
      </h2>
      <p class="mt-2 max-w-2xl text-(--color-text-muted)">
        How I can help, from a first line of code to long-term support.
      </p>

      <div class="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div
          v-for="service in services"
          :key="service.number"
          class="group relative overflow-hidden rounded-lg border border-(--color-border) p-6 transition-all duration-300 hover:border-(--color-primary) hover:shadow-[0_0_24px_-6px_var(--color-primary)] sm:p-8"
        >
          <span
            aria-hidden="true"
            class="pointer-events-none absolute -top-6 -right-2 font-heading text-7xl font-bold text-(--color-text)/5 transition-colors duration-300 select-none group-hover:text-(--color-primary)/10 sm:text-8xl"
          >
            {{ service.number }}
          </span>

          <div class="relative flex flex-col gap-4">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-lg border border-(--color-border) text-(--color-primary) transition-all duration-300 group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:border-(--color-primary)"
            >
              <Icon :icon="`lucide:${service.icon}`" class="h-6 w-6" />
            </div>

            <h3 class="font-heading text-lg font-semibold text-(--color-text) sm:text-xl">
              {{ service.title }}
            </h3>

            <p class="text-sm leading-relaxed text-(--color-text-muted)">
              {{ service.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
