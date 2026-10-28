<script setup lang="ts">
import { ref } from 'vue'
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

// The card leans toward the cursor and a soft light follows it (mouse only; not under reduced motion).
const card = ref<HTMLElement | null>(null)
const moving = ref(false)

function lean(event: PointerEvent) {
  const el = card.value
  if (!el || event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const box = el.getBoundingClientRect()
  const x = (event.clientX - box.left) / box.width
  const y = (event.clientY - box.top) / box.height
  moving.value = true
  el.style.setProperty('--rx', `${((0.5 - y) * 7).toFixed(2)}deg`)
  el.style.setProperty('--ry', `${((x - 0.5) * 9).toFixed(2)}deg`)
  el.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`)
  el.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`)
}

function settle() {
  moving.value = false
  const el = card.value
  if (!el) return
  for (const name of ['--rx', '--ry']) el.style.setProperty(name, '0deg')
}
</script>

<template>
  <article
    ref="card"
    class="tilt group relative flex min-w-0 flex-col border border-(--color-border) bg-(--color-bg-elevated) transition-[translate,border-color,box-shadow] duration-300 hover:-translate-y-1.5 hover:border-(--color-primary) hover:shadow-[0_0_28px_-8px_var(--color-primary)]"
    :class="{ moving }"
    @pointermove="lean"
    @pointerleave="settle"
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

<style scoped>
.tilt {
  transform: perspective(900px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
  transition:
    transform 0.55s cubic-bezier(0.2, 0.8, 0.2, 1),
    translate 0.3s,
    border-color 0.3s,
    box-shadow 0.3s;
}

.tilt.moving {
  transition:
    transform 0.08s linear,
    translate 0.3s,
    border-color 0.3s,
    box-shadow 0.3s;
}

/* The light that follows the cursor */
.tilt::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  background: radial-gradient(circle at var(--gx, 50%) var(--gy, 0%), color-mix(in srgb, var(--color-text) 14%, transparent), transparent 55%);
  transition: opacity 0.3s;
}

.tilt:hover::after {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .tilt, .tilt.moving { transform: none; transition: none; }
  .tilt::after { display: none; }
}
</style>
