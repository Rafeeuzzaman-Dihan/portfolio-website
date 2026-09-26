import { onBeforeUnmount, ref, toValue, type MaybeRefOrGetter } from 'vue'

// Text that can show as a same-length stream of 0s and 1s (spaces kept) and decode back
// into the real text from left to right, like the hero dossier file lines.
export function useDecodeText(text: MaybeRefOrGetter<string>) {
  const shown = ref(toValue(text))
  let frame = 0

  const noise = (value: string) => value.replace(/[^ ]/g, () => (Math.random() < 0.5 ? '0' : '1'))

  function scramble() {
    cancelAnimationFrame(frame)
    shown.value = noise(toValue(text))
  }

  function decode(duration = 500) {
    cancelAnimationFrame(frame)
    const target = toValue(text)
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const settled = Math.floor(progress * target.length)
      shown.value = target.slice(0, settled) + noise(target.slice(settled))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
  }

  function reset() {
    cancelAnimationFrame(frame)
    shown.value = toValue(text)
  }

  onBeforeUnmount(() => cancelAnimationFrame(frame))

  return { shown, scramble, decode, reset }
}
