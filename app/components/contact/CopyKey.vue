<script setup lang="ts">
import { Icon } from '@iconify/vue/offline'

const props = defineProps<{
  text: string
  label: string
}>()

const { copied, copy } = useClipboard(1400)
</script>

<template>
  <button
    type="button"
    class="key grid size-[30px] cursor-pointer place-items-center rounded-md border bg-(--color-bg) text-(--color-text) transition-[translate,box-shadow,border-color,color] duration-150 hover:border-(--color-primary) active:translate-y-[3px] active:shadow-none focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-(--color-primary-light)"
    :class="copied ? 'border-(--color-live) text-(--color-live) shadow-[0_3px_0_var(--color-live)]' : 'border-(--color-secondary) shadow-[0_3px_0_var(--color-secondary)]'"
    :aria-label="copied ? `${props.label} copied` : props.label"
    @click="copy(props.text)"
  >
    <Icon :icon="copied ? 'lucide:check' : 'lucide:copy'" class="size-3.5" />
  </button>
</template>
