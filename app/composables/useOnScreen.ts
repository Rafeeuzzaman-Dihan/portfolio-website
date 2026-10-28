import { onBeforeUnmount, onMounted, ref } from 'vue'

// Tracks whether an element is on screen right now (unlike useScrollReveal, which fires once), so endless
// animations can pause while nobody can see them.
export function useOnScreen(rootMargin = '120px') {
  const el = ref<HTMLElement | null>(null)
  const onScreen = ref(true)
  let observer: IntersectionObserver | undefined

  onMounted(() => {
    if (!el.value || !('IntersectionObserver' in window)) return
    observer = new IntersectionObserver(([entry]) => (onScreen.value = !!entry?.isIntersecting), { rootMargin })
    observer.observe(el.value)
  })

  onBeforeUnmount(() => observer?.disconnect())

  return { el, onScreen }
}
