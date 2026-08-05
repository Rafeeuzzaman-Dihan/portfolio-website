import { computed, onMounted, onUnmounted, ref, toValue, type MaybeRefOrGetter } from 'vue'

export function useCarousel(length: MaybeRefOrGetter<number>, autoplayMs = 6000) {
  const len = computed(() => toValue(length))
  const index = ref(0)
  const direction = ref<'next' | 'prev'>('next')

  let timer: ReturnType<typeof setInterval> | undefined

  function stopAutoplay() {
    if (timer !== undefined) {
      clearInterval(timer)
      timer = undefined
    }
  }

  function startAutoplay() {
    stopAutoplay()
    if (len.value <= 1) return
    timer = setInterval(next, autoplayMs)
  }

  function next() {
    direction.value = 'next'
    index.value = (index.value + 1) % len.value
  }

  function prev() {
    direction.value = 'prev'
    index.value = (index.value - 1 + len.value) % len.value
  }

  function goTo(target: number) {
    direction.value = target > index.value ? 'next' : 'prev'
    index.value = target
  }

  onMounted(startAutoplay)
  onUnmounted(stopAutoplay)

  return { index, direction, next, prev, goTo, startAutoplay, stopAutoplay }
}
