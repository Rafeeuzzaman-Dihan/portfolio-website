<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const props = defineProps<{
  target: string
}>()

const visible = ref(true)

function onScroll() {
  visible.value = window.scrollY <= 100
}

function scrollToTarget() {
  document.querySelector(props.target)?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <div
    class="relative flex flex-col items-center gap-3 transition-opacity duration-300"
    :class="visible ? 'opacity-100' : 'pointer-events-none opacity-0'"
  >
    <span
      class="pl-[0.35em] font-heading text-[0.625rem] font-medium uppercase tracking-[0.35em] text-(--color-text-muted)"
      aria-hidden="true"
    >
      Scroll
    </span>

    <button
      type="button"
      aria-label="Scroll down"
      :tabindex="visible ? 0 : -1"
      class="key"
      @click="scrollToTarget"
    >
      <span class="ripple" aria-hidden="true" />
      <svg
        class="key-arrow"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.25"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M12 5v14M6 13l6 6 6-6" />
      </svg>
    </button>

    <span class="trail hidden md:block" aria-hidden="true" />
  </div>
</template>

<style scoped>
/* A game-style keycap: it presses, ripples, then a line draws down toward the next section. */
.key {
  --key-edge: color-mix(in srgb, var(--color-secondary) 30%, transparent);

  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  padding: 0;
  border: 1px solid color-mix(in srgb, var(--color-secondary) 35%, transparent);
  border-radius: 0.5rem;
  background: var(--color-bg-elevated);
  color: var(--color-primary-light);
  cursor: pointer;
  box-shadow: 0 4px 0 var(--key-edge);
  animation: key-press 2.6s ease-in-out infinite;
}

.key:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
}

.ripple {
  position: absolute;
  inset: -1px;
  border: 1px solid var(--color-primary-light);
  border-radius: 0.5rem;
  pointer-events: none;
  animation: key-ripple 2.6s ease-out infinite;
}

.key-arrow {
  animation: key-nudge 2.6s ease-in-out infinite;
}

.trail {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 50%;
  width: 1px;
  height: 2.75rem;
  margin-left: -0.5px;
  background: linear-gradient(to bottom, var(--color-primary-light), transparent);
  transform-origin: top;
  animation: key-trail 2.6s ease-in-out infinite;
}

@keyframes key-press {
  0%,
  55%,
  100% {
    transform: translateY(0);
    box-shadow: 0 4px 0 var(--key-edge);
  }
  62%,
  74% {
    transform: translateY(3px);
    box-shadow: 0 1px 0 var(--key-edge);
  }
}

@keyframes key-ripple {
  0%,
  58% {
    opacity: 0;
    transform: scale(0.9);
  }
  62% {
    opacity: 0.55;
  }
  100% {
    opacity: 0;
    transform: scale(1.9);
  }
}

@keyframes key-nudge {
  0%,
  55%,
  100% {
    transform: translateY(0);
  }
  62%,
  74% {
    transform: translateY(2px);
  }
}

@keyframes key-trail {
  0%,
  60% {
    transform: scaleY(0);
    opacity: 1;
  }
  82% {
    transform: scaleY(1);
    opacity: 1;
  }
  100% {
    transform: scaleY(1);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .key,
  .ripple,
  .key-arrow,
  .trail {
    animation: none;
  }

  .ripple {
    opacity: 0;
  }

  .trail {
    opacity: 0.5;
  }
}
</style>
