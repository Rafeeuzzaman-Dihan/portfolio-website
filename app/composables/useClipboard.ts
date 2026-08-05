import { ref } from 'vue'

export function useClipboard(resetDelay = 2000) {
  const copied = ref(false)
  let timeout: ReturnType<typeof setTimeout> | undefined

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      copied.value = true
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        copied.value = false
      }, resetDelay)
    } catch {
      copied.value = false
    }
  }

  return { copied, copy }
}
