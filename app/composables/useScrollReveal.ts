import { onUnmounted, ref } from 'vue'

export function useScrollReveal(options: IntersectionObserverInit = { threshold: 0.2, rootMargin: '0px 0px -80px 0px' }) {
  const visible = ref(false)
  let observer: IntersectionObserver | undefined

  function target(el: Element | null) {
    observer?.disconnect()
    if (!el) return

    observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        visible.value = true
        observer?.disconnect()
      }
    }, options)
    observer.observe(el)
  }

  onUnmounted(() => observer?.disconnect())

  return { visible, target }
}
