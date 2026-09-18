<script setup lang="ts">
import { ref } from 'vue'
import type { Role } from '~/composables/useRoleTransition'

const props = defineProps<{
  prefix: string
  roles: Role[]
}>()

const rootRef = ref<HTMLElement | null>(null)
const { view } = useRoleTransition(props.roles, rootRef)
</script>

<template>
  <div
    ref="rootRef"
    class="flex flex-col items-start gap-[0.45em] leading-[1.2] sm:flex-row sm:items-center sm:gap-[0.3em]"
  >
    <span class="whitespace-nowrap text-(--color-text-muted)">{{ prefix }} a<span class="article-n" :class="{ 'is-open': view.showN }">n</span></span>

    <span class="relative inline-block py-[0.1em] pr-[0.2em] text-(--color-primary)">
      <span class="sr-only">{{ view.role.label }}</span>

      <!-- Invisible sizer: holds the width of the longer of the outgoing/incoming words. -->
      <span class="invisible inline-grid whitespace-nowrap" aria-hidden="true">
        <span class="[grid-area:1/1]">{{ view.role.label }}</span>
        <span v-if="view.animating" class="[grid-area:1/1]">{{ view.oldRole.label }}</span>
      </span>

      <span class="absolute bottom-[0.1em] left-0 right-[0.2em] top-[0.1em]" aria-hidden="true">
        <span class="layer" :style="view.outWrap"><span class="layer-text" :style="view.outText">{{ view.oldRole.label }}</span></span>
        <span class="layer" :style="view.inWrap"><span class="layer-text" :style="view.inText">{{ view.inPrefix }}<span class="tail">{{ view.inTail }}</span><span v-if="view.cursor" class="cursor" :style="{ opacity: view.cursor }" /></span></span>
        <span v-if="view.edge" class="edge" :style="view.edge" />
        <span v-if="view.head" class="head" :style="view.head" />
      </span>

      <span class="flash" :style="{ opacity: view.flash * 0.3 }" aria-hidden="true" />
    </span>
  </div>
</template>

<style scoped>
.article-n {
  display: inline-block;
  overflow: hidden;
  vertical-align: bottom;
  max-width: 0;
  opacity: 0;
  transition:
    max-width 0.3s ease,
    opacity 0.3s ease;
}

.article-n.is-open {
  max-width: 0.7em;
  opacity: 1;
}

.layer {
  position: absolute;
  inset: 0;
  white-space: nowrap;
}

.layer-text {
  display: inline-block;
  will-change: transform, filter, opacity;
}

.tail {
  color: var(--color-secondary);
  opacity: 0.85;
}

.cursor {
  display: inline-block;
  width: 0.09em;
  height: 0.78em;
  margin-left: 0.07em;
  vertical-align: -0.06em;
  background: var(--color-primary-light);
}

.edge {
  position: absolute;
  top: -0.18em;
  bottom: -0.18em;
  width: 2px;
  background: var(--color-primary-light);
  pointer-events: none;
}

.head {
  position: absolute;
  top: -0.42em;
  width: 0.3em;
  height: 0.26em;
  background: var(--color-primary-light);
  clip-path: polygon(0 0, 100% 0, 50% 100%);
  pointer-events: none;
}

.flash {
  position: absolute;
  inset: -0.05em -0.3em;
  background: var(--color-text);
  opacity: 0;
  pointer-events: none;
}
</style>
