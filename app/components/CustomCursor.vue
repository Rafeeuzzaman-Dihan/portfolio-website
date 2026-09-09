<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const HOVER_SELECTOR = 'a, button, [role="button"], input, textarea, [data-cursor-hover]'

const dot = ref<HTMLElement | null>(null)
const ring = ref<HTMLElement | null>(null)
const isHover = ref(false)
const isActive = ref(false)

let rafId: number | undefined
let reduceMotion = false

const target = { x: 0, y: 0 }
const ringPos = { x: 0, y: 0 }
let hasPosition = false

function applyDotTransform() {
  dot.value!.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`
}

function applyRingTransform() {
  ring.value!.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`
}

function onMouseMove(event: MouseEvent) {
  target.x = event.clientX
  target.y = event.clientY

  if (!hasPosition) {
    hasPosition = true
    ringPos.x = target.x
    ringPos.y = target.y
  }

  if (!dot.value) return

  if (reduceMotion) {
    applyDotTransform()
    ringPos.x = target.x
    ringPos.y = target.y
    applyRingTransform()
    return
  }

  applyDotTransform()
}

function onMouseOver(event: MouseEvent) {
  const el = event.target as Element | null
  isHover.value = !!el?.closest(HOVER_SELECTOR)
}

function onMouseOut(event: MouseEvent) {
  const related = event.relatedTarget as Element | null
  if (!related?.closest(HOVER_SELECTOR)) isHover.value = false
}

function tick() {
  ringPos.x += (target.x - ringPos.x) * 0.18
  ringPos.y += (target.y - ringPos.y) * 0.18
  applyRingTransform()
  rafId = requestAnimationFrame(tick)
}

onMounted(() => {
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches
  if (isCoarsePointer) return

  reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  isActive.value = true

  window.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseover', onMouseOver)
  document.addEventListener('mouseout', onMouseOut)

  if (!reduceMotion) rafId = requestAnimationFrame(tick)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseover', onMouseOver)
  document.removeEventListener('mouseout', onMouseOut)
  if (rafId !== undefined) cancelAnimationFrame(rafId)
})
</script>

<template>
  <ClientOnly>
    <template v-if="isActive">
      <div ref="dot" class="cursor-dot" :class="{ 'is-hover': isHover }" />
      <div ref="ring" class="cursor-ring" :class="{ 'is-hover': isHover }" />
    </template>
  </ClientOnly>
</template>

<style scoped>
.cursor-dot,
.cursor-ring {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  border-radius: 9999px;
  pointer-events: none;
  will-change: transform;
}

.cursor-dot {
  --cursor-color: var(--color-primary, #3b82f6);

  width: 6px;
  height: 6px;
  margin: -3px 0 0 -3px;
  background: var(--cursor-color);
  transition: width 0.2s ease-out, height 0.2s ease-out, margin 0.2s ease-out, opacity 0.2s ease-out;
}

.cursor-dot.is-hover {
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  opacity: 0.5;
}

.cursor-ring {
  --cursor-color: var(--color-primary, #3b82f6);

  width: 30px;
  height: 30px;
  margin: -15px 0 0 -15px;
  border: 1px solid var(--cursor-color);
  opacity: 0.5;
  transition: opacity 0.2s ease-out;
}

.cursor-ring.is-hover {
  opacity: 0.5;
}

@media (prefers-reduced-motion: reduce) {
  .cursor-dot,
  .cursor-ring {
    transition: none;
  }
}
</style>
