<script setup lang="ts">
import testimonials from '~~/content/testimonials.json'

const { index, direction, next, prev, goTo, startAutoplay, stopAutoplay } = useCarousel(testimonials.length)

const current = computed(() => testimonials[index.value])

const SWIPE_THRESHOLD = 40
let touchStartX: number | null = null

function onTouchStart(event: TouchEvent) {
  touchStartX = event.touches[0]?.clientX ?? null
  stopAutoplay()
}

function onTouchEnd(event: TouchEvent) {
  if (touchStartX === null) return
  const endX = event.changedTouches[0]?.clientX ?? touchStartX
  const delta = endX - touchStartX

  if (delta > SWIPE_THRESHOLD) prev()
  else if (delta < -SWIPE_THRESHOLD) next()

  touchStartX = null
  startAutoplay()
}

function handleManualNav(action: () => void) {
  action()
  startAutoplay()
}
</script>

<template>
  <div
    class="mx-auto flex w-full max-w-2xl flex-col items-center gap-6"
    @touchstart.passive="onTouchStart"
    @touchend="onTouchEnd"
  >
    <div class="relative min-h-[180px] w-full overflow-hidden sm:min-h-[150px]">
      <Transition
        mode="out-in"
        enter-active-class="transition duration-400 ease-out"
        :enter-from-class="direction === 'next' ? 'opacity-0 translate-x-6' : 'opacity-0 -translate-x-6'"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-x-0"
        :leave-to-class="direction === 'next' ? 'opacity-0 -translate-x-6' : 'opacity-0 translate-x-6'"
      >
        <figure :key="index" class="flex flex-col items-center gap-4 text-center">
          <blockquote class="text-balance text-base leading-relaxed text-(--color-text-muted) sm:text-lg">
            “{{ current?.quote }}”
          </blockquote>
          <figcaption class="flex flex-col items-center gap-0.5">
            <span class="font-heading text-sm font-semibold text-(--color-text)">{{ current?.name }}</span>
            <span class="text-xs text-(--color-secondary)">{{ current?.role }}</span>
          </figcaption>
        </figure>
      </Transition>
    </div>

    <div class="flex items-center gap-4">
      <button
        type="button"
        aria-label="Previous testimonial"
        class="flex h-8 w-8 items-center justify-center rounded-full text-(--color-text-muted) transition-colors hover:text-(--color-primary)"
        @click="handleManualNav(prev)"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>

      <div class="flex items-center gap-2">
        <button
          v-for="(testimonial, i) in testimonials"
          :key="testimonial.name"
          type="button"
          :aria-label="`Go to testimonial ${i + 1}`"
          class="h-1.5 rounded-full transition-all duration-300"
          :class="i === index ? 'w-5 bg-(--color-primary)' : 'w-1.5 bg-(--color-border) hover:bg-(--color-secondary)'"
          @click="handleManualNav(() => goTo(i))"
        />
      </div>

      <button
        type="button"
        aria-label="Next testimonial"
        class="flex h-8 w-8 items-center justify-center rounded-full text-(--color-text-muted) transition-colors hover:text-(--color-primary)"
        @click="handleManualNav(next)"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </div>
  </div>
</template>
