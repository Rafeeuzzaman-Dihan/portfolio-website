<script setup lang="ts">
withDefaults(defineProps<{
  text: string
  level?: 2 | 3
}>(), { level: 2 })
</script>

<template>
  <div class="flex items-center gap-3.5">
    <span class="size-2.5 shrink-0 bg-(--color-primary)" aria-hidden="true" />
    <component
      :is="`h${level}`"
      class="font-heading font-bold leading-none tracking-[-0.035em] text-(--color-text)"
      :class="level === 2 ? 'text-[clamp(2.5rem,7vw,4.5rem)]' : 'text-[clamp(1.75rem,4.5vw,2.75rem)]'"
    >
      {{ text }}
    </component>
  </div>
</template>
