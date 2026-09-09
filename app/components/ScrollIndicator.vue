<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const props = defineProps<{
  target: string
}>()

const visible = ref(true)

const capsuleTrailRef = ref<SVGPathElement | null>(null)
const capsuleTipRef = ref<SVGPathElement | null>(null)
const arrowRef = ref<SVGPathElement | null>(null)

const capsuleLen = ref(140)
const arrowLen = ref(40)

function onScroll() {
  visible.value = window.scrollY <= 100
}

function scrollToTarget() {
  document.querySelector(props.target)?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })

  if (capsuleTrailRef.value) capsuleLen.value = capsuleTrailRef.value.getTotalLength()
  if (arrowRef.value) arrowLen.value = arrowRef.value.getTotalLength()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <button
    type="button"
    aria-label="Scroll down"
    class="transition-opacity duration-300"
    :class="visible ? 'opacity-100' : 'pointer-events-none opacity-0'"
    @click="scrollToTarget"
  >
    <svg
      class="h-14 w-8"
      viewBox="0 0 32 56"
      fill="none"
      :style="{ '--capsule-len': `${capsuleLen}px`, '--arrow-len': `${arrowLen}px` }"
    >
      <path
        ref="capsuleTrailRef"
        class="capsule-trail"
        d="M16 2 A14 14 0 0 1 30 16 L30 40 A14 14 0 0 1 16 54 A14 14 0 0 1 2 40 L2 16 A14 14 0 0 1 16 2 Z"
        stroke="var(--color-scroll-track)"
        stroke-width="2"
        fill="none"
      />
      <path
        ref="capsuleTipRef"
        class="capsule-tip"
        d="M16 2 A14 14 0 0 1 30 16 L30 40 A14 14 0 0 1 16 54 A14 14 0 0 1 2 40 L2 16 A14 14 0 0 1 16 2 Z"
        stroke="var(--color-scroll-arrow)"
        stroke-width="2"
        fill="none"
      />

      <svg x="4" y="16" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          ref="arrowRef"
          class="arrow-path"
          d="M12 4 L12 17 L5 10 L12 17 L19 10"
          stroke="var(--color-scroll-arrow)"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          fill="none"
        />
      </svg>
    </svg>
  </button>
</template>

<style scoped>
.capsule-trail,
.capsule-tip {
  stroke-dasharray: var(--capsule-len);
  stroke-dashoffset: var(--capsule-len);
  animation: capsule-draw 5s ease-in-out infinite;
}

.capsule-tip {
  stroke-dasharray: 10 calc(var(--capsule-len) - 10);
}

@keyframes capsule-draw {
  0% {
    stroke-dashoffset: var(--capsule-len);
  }
  20% {
    stroke-dashoffset: 0;
  }
  72% {
    stroke-dashoffset: 0;
  }
  80%,
  100% {
    stroke-dashoffset: calc(var(--capsule-len) * -1);
  }
}

.arrow-path {
  stroke-dasharray: var(--arrow-len);
  stroke-dashoffset: var(--arrow-len);
  animation: arrow-draw 5s ease-in-out infinite;
}

@keyframes arrow-draw {
  0%,
  20% {
    stroke-dashoffset: var(--arrow-len);
  }
  36% {
    stroke-dashoffset: 0;
  }
  60% {
    stroke-dashoffset: 0;
  }
  72%,
  100% {
    stroke-dashoffset: calc(var(--arrow-len) * -1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .capsule-trail,
  .capsule-tip,
  .arrow-path {
    animation: none;
    stroke-dashoffset: 0;
  }
}
</style>
