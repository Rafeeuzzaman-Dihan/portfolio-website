<script setup lang="ts">
defineProps<{
  social: { platform: string, url: string, icon: string }
  /** Tile size in px. */
  size?: number
}>()
</script>

<template>
  <a
    :href="social.url"
    :target="social.url.startsWith('mailto:') ? undefined : '_blank'"
    :rel="social.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'"
    :aria-label="social.platform"
    class="grid shrink-0 place-items-center border border-(--color-border) bg-(--color-bg) text-(--color-text-muted) transition-[translate,color,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-(--color-primary) hover:text-(--color-primary-light) hover:shadow-[0_0_20px_-8px_var(--color-primary)] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-(--color-primary-light)"
    :style="{ width: `${size ?? 46}px`, height: `${size ?? 46}px` }"
  >
    <IconsSocialIcon :name="social.icon" />
  </a>
</template>
