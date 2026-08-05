import { computed, onMounted, onUnmounted, ref, toValue, type MaybeRefOrGetter } from 'vue'

export function useRotatingText(words: MaybeRefOrGetter<string[]>, intervalMs = 2200) {
  const list = computed(() => toValue(words))
  const index = ref(0)
  const currentWord = computed(() => list.value[index.value] ?? '')

  let timer: ReturnType<typeof setInterval> | undefined

  function stop() {
    if (timer !== undefined) {
      clearInterval(timer)
      timer = undefined
    }
  }

  function start() {
    stop()
    if (list.value.length <= 1) return
    timer = setInterval(() => {
      index.value = (index.value + 1) % list.value.length
    }, intervalMs)
  }

  onMounted(start)
  onUnmounted(stop)

  return { currentWord, index }
}
