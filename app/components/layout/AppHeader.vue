<script setup lang="ts">
const links = [
  { href: '#home', label: 'Home' },
  { href: '#expertise', label: 'Expertise' },
  { href: '#experience', label: 'Experience' },
  { href: '#projects', label: 'Projects' },
  { href: '#services', label: 'Services' },
  { href: '#contact', label: 'Contact' }
]

const isRevealed = ref(false)
const isMobileMenuOpen = ref(false)

let observer: IntersectionObserver | undefined

onMounted(() => {
  const hero = document.getElementById('home')

  if (!hero) {
    isRevealed.value = true
    return
  }

  observer = new IntersectionObserver(
    ([entry]) => {
      isRevealed.value = !entry.isIntersecting
    },
    { threshold: 0, rootMargin: '-72px 0px 0px 0px' }
  )
  observer.observe(hero)
})

onUnmounted(() => {
  observer?.disconnect()
})

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-50 transition-colors duration-300"
    :class="isRevealed
      ? 'border-b border-(--color-border) bg-(--color-bg)/80 backdrop-blur-md'
      : 'border-b border-transparent bg-transparent'"
  >
    <nav class="section-container flex h-16 items-center justify-between sm:h-18">
      <a
        href="#home"
        class="font-heading text-lg font-bold tracking-tight text-(--color-text) transition-colors hover:text-(--color-primary) sm:text-xl"
        @click="closeMobileMenu"
      >
        <span class="text-(--color-primary)">R</span>D
      </a>

      <ul class="hidden items-center gap-8 md:flex">
        <li v-for="link in links" :key="link.href">
          <a
            :href="link.href"
            class="text-sm font-medium text-(--color-text-muted) transition-colors hover:text-(--color-primary)"
          >
            {{ link.label }}
          </a>
        </li>
      </ul>

      <button
        type="button"
        class="inline-flex h-10 w-10 items-center justify-center text-(--color-text) transition-colors hover:text-(--color-primary) md:hidden"
        :aria-expanded="isMobileMenuOpen"
        aria-controls="mobile-nav"
        :aria-label="isMobileMenuOpen ? 'Close menu' : 'Open menu'"
        @click="isMobileMenuOpen = !isMobileMenuOpen"
      >
        <svg
          v-if="!isMobileMenuOpen"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          class="h-6 w-6"
          aria-hidden="true"
        >
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
        <svg
          v-else
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          class="h-6 w-6"
          aria-hidden="true"
        >
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </nav>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <ul
        v-if="isMobileMenuOpen"
        id="mobile-nav"
        class="flex flex-col gap-1 border-t border-(--color-border) bg-(--color-bg) px-4 pb-4 pt-2 md:hidden"
      >
        <li v-for="link in links" :key="link.href">
          <a
            :href="link.href"
            class="block rounded-md px-3 py-3 text-base font-medium text-(--color-text-muted) transition-colors hover:text-(--color-primary)"
            @click="closeMobileMenu"
          >
            {{ link.label }}
          </a>
        </li>
      </ul>
    </Transition>
  </header>
</template>
