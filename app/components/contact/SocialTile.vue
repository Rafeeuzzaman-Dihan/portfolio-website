<script setup lang="ts">
defineProps<{
  social: { platform: string, url: string, icon: string }
  /** Tile size in px. */
  size?: number
}>()

// Magnet: the tile leans a few pixels toward the cursor (mouse only, not under reduced motion).
function pull(event: PointerEvent) {
  const tile = event.currentTarget as HTMLElement
  if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const box = tile.getBoundingClientRect()
  tile.style.setProperty('--mx', `${((event.clientX - box.left) / box.width - 0.5) * 8}px`)
  tile.style.setProperty('--my', `${((event.clientY - box.top) / box.height - 0.5) * 8}px`)
}

function release(event: PointerEvent) {
  const tile = event.currentTarget as HTMLElement
  tile.style.setProperty('--mx', '0px')
  tile.style.setProperty('--my', '0px')
}
</script>

<template>
  <a
    :href="social.url"
    :target="social.url.startsWith('mailto:') ? undefined : '_blank'"
    :rel="social.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'"
    :aria-label="social.platform"
    class="magnet grid shrink-0 place-items-center border border-(--color-border) bg-(--color-bg) text-(--color-text-muted) transition-[translate,color,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-(--color-primary) hover:text-(--color-primary-light) hover:shadow-[0_0_20px_-8px_var(--color-primary)] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-(--color-primary-light)"
    :style="{ width: `${size ?? 46}px`, height: `${size ?? 46}px` }"
    @pointermove="pull"
    @pointerleave="release"
  >
    <IconsSocialIcon :name="social.icon" />
  </a>
</template>

<style scoped>
.magnet {
  transform: translate(var(--mx, 0px), var(--my, 0px));
  transition:
    transform 0.18s ease-out,
    translate 0.3s,
    color 0.3s,
    border-color 0.3s,
    box-shadow 0.3s;
}

@media (prefers-reduced-motion: reduce) {
  .magnet { transform: none; transition: none; }
}
</style>
