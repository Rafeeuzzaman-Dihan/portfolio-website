<script setup lang="ts">
import { Icon } from '@iconify/vue/offline'

defineProps<{
  service: {
    scene: 'saas' | 'shop' | 'business' | 'mvp' | 'web'
    icon: string
    title: string
    tagline: string
    label: string
    gets: string[]
  }
  counter: string
}>()
</script>

<template>
  <article
    class="group flex min-w-0 flex-col border border-(--color-border) bg-(--color-bg-elevated) transition-[translate,border-color,box-shadow] duration-300 hover:-translate-y-1.5 hover:border-(--color-primary) hover:shadow-[0_0_28px_-8px_var(--color-primary)]"
  >
    <ServicesServiceScene :kind="service.scene" :label="service.label" :counter="counter" />

    <div class="flex flex-1 flex-col gap-4 px-6 pt-6 pb-7">
      <div class="flex items-center gap-3.5">
        <span class="grid size-11 shrink-0 place-items-center rounded-[10px] border border-(--color-border) bg-(--color-bg) text-(--color-primary) transition-colors duration-300 group-hover:border-(--color-primary)">
          <Icon :icon="`solar:${service.icon}`" class="size-6" />
        </span>
        <h3 class="font-heading text-xl leading-tight font-semibold tracking-[-0.015em] text-(--color-text)">
          {{ service.title }}
        </h3>
      </div>

      <p class="text-[0.95rem] text-(--color-text-muted)">
        {{ service.tagline }}
      </p>

      <ul class="mt-0.5 grid gap-2 text-sm text-(--color-text)">
        <li v-for="item in service.gets" :key="item" class="flex items-baseline gap-2.5">
          <span class="size-1.5 shrink-0 -translate-y-px bg-(--color-primary)" aria-hidden="true" />
          {{ item }}
        </li>
      </ul>
    </div>
  </article>
</template>
