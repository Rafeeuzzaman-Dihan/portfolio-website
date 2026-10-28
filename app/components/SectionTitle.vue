<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  text: string
  level?: 2 | 3
}>(), { level: 2 })

const letters = computed(() => props.text.split(''))
</script>

<template>
  <div class="flex items-center gap-3.5">
    <span class="size-2.5 shrink-0 bg-(--color-primary)" aria-hidden="true" />
    <component
      :is="`h${level}`"
      class="relative font-heading font-bold leading-none tracking-[-0.035em] text-(--color-text)"
      :class="level === 2 ? 'text-[clamp(2.5rem,7vw,4.5rem)]' : 'text-[clamp(1.75rem,4.5vw,2.75rem)]'"
      :aria-label="text"
    >
      <span aria-hidden="true"><span v-for="(letter, index) in letters" :key="index" class="ch">{{ letter }}</span></span>
      <span class="squiggle" :class="{ small: level === 3 }" aria-hidden="true" />
    </component>
  </div>
</template>

<style scoped>
/* Hover a letter and it hops and turns the accent colour for a moment. */
.ch {
  display: inline-block;
  white-space: pre;
}

.ch:hover {
  animation: hop 0.55s cubic-bezier(0.3, 1.6, 0.5, 1);
}

@keyframes hop {
  35% { transform: translateY(-0.14em) rotate(-6deg); color: var(--color-primary); }
}

/* A wavy line in the warm accent slides along under the title. */
.squiggle {
  position: absolute;
  bottom: -18px;
  left: 0;
  width: min(100%, 6.5ch);
  height: 10px;
  background: var(--color-warm);
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='10' viewBox='0 0 24 10'%3E%3Cpath d='M0 5 Q6 0 12 5 T24 5' fill='none' stroke='black' stroke-width='2.6'/%3E%3C/svg%3E") repeat-x 0 0 / 24px 10px;
  animation: slide 1.1s linear infinite;
}

.squiggle.small {
  bottom: -14px;
}

@keyframes slide {
  to { mask-position: 24px 0; }
}

@media (prefers-reduced-motion: reduce) {
  .squiggle { animation: none; }
  .ch:hover { animation: none; }
}
</style>
