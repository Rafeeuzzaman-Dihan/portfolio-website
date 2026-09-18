<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import profile from '~~/content/profile.json'

const links = useNavLinks()
const sectionIds = links.map((link) => link.href.replace('#', ''))

const active = ref(0)
const progress = ref(0)
const isMenuOpen = ref(false)

const rootRef = ref<HTMLElement | null>(null)
const listRef = ref<HTMLElement | null>(null)
const highlight = reactive({ x: 0, w: 0, ready: false })

let ticking = false
let resizeObserver: ResizeObserver | undefined

// Scroll-spy + progress: the active link is the last section whose top has passed 35% of the viewport.
function update() {
  ticking = false
  const y = window.scrollY
  const max = document.documentElement.scrollHeight - window.innerHeight
  progress.value = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0

  const line = window.innerHeight * 0.35
  let index = 0
  sectionIds.forEach((id, i) => {
    const el = document.getElementById(id)
    if (el && el.getBoundingClientRect().top <= line) index = i
  })
  if (max > 0 && y >= max - 4) index = sectionIds.length - 1
  active.value = index
}

function onScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(update)
}

// The sliding highlight follows the real width of each link, so it stays exact whatever the font does.
function measure() {
  const item = listRef.value?.children[active.value] as HTMLElement | undefined
  if (!item) return
  highlight.x = item.offsetLeft
  highlight.w = item.offsetWidth
}

function closeMenu() {
  isMenuOpen.value = false
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closeMenu()
}

function onDocumentClick(e: MouseEvent) {
  if (isMenuOpen.value && rootRef.value && !rootRef.value.contains(e.target as Node)) closeMenu()
}

watch(active, () => nextTick(measure))

onMounted(async () => {
  update()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  window.addEventListener('keydown', onKeydown)
  document.addEventListener('click', onDocumentClick)

  await nextTick()
  measure()
  if (listRef.value) {
    resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(listRef.value)
  }
  document.fonts?.ready.then(measure)
  // Enable the slide transition only after the first placement, so it doesn't fly in from the left.
  requestAnimationFrame(() => {
    highlight.ready = true
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  window.removeEventListener('keydown', onKeydown)
  document.removeEventListener('click', onDocumentClick)
  resizeObserver?.disconnect()
})
</script>

<template>
  <header class="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-3 lg:top-4">
    <div
      ref="rootRef"
      class="pointer-events-auto w-full max-w-lg overflow-hidden border border-(--color-secondary)/20 bg-(--color-bg-elevated)/75 shadow-xl shadow-black/40 backdrop-blur-md transition-[border-radius] duration-300 lg:w-auto lg:max-w-none"
      :class="isMenuOpen ? 'rounded-[1.75rem]' : 'rounded-full'"
    >
      <nav aria-label="Primary">
        <div class="relative flex h-14 items-center justify-between pl-5 pr-1.5 lg:justify-start lg:gap-2 lg:pl-[1.375rem]">
          <a
            href="#home"
            class="rounded-md font-heading text-xl font-bold tracking-tight text-(--color-text) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
            @click="closeMenu"
          >
            <span class="text-(--color-primary)">R</span>D
          </a>

          <!-- Desktop: links with a sliding highlight, then Resume -->
          <span class="mx-1.5 hidden h-[22px] w-px bg-(--color-secondary)/25 lg:block" aria-hidden="true" />

          <div class="relative hidden lg:block">
            <span
              class="absolute inset-y-0 left-0 rounded-full border border-(--color-primary)/40 bg-(--color-primary)/15"
              :class="highlight.ready ? 'transition-[transform,width] duration-300 ease-out' : ''"
              :style="{ width: `${highlight.w}px`, transform: `translateX(${highlight.x}px)` }"
              aria-hidden="true"
            />
            <ul ref="listRef" class="relative flex gap-0.5">
              <li v-for="(link, i) in links" :key="link.href">
                <a
                  :href="link.href"
                  :aria-current="active === i ? 'location' : undefined"
                  class="flex h-10 items-center rounded-full px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-(--color-primary)"
                  :class="active === i ? 'text-(--color-text)' : 'text-(--color-text-muted) hover:text-(--color-text)'"
                >
                  {{ link.label }}
                </a>
              </li>
            </ul>
          </div>

          <span class="mx-1.5 hidden h-[22px] w-px bg-(--color-secondary)/25 lg:block" aria-hidden="true" />

          <a
            :href="profile.resumeUrl"
            target="_blank"
            rel="noopener"
            class="hidden h-[42px] items-center gap-2 rounded-full border border-(--color-secondary)/35 px-[18px] text-sm font-medium text-(--color-text) transition-colors hover:border-(--color-primary-light) hover:text-(--color-primary-light) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary) lg:inline-flex"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[15px] w-[15px]" aria-hidden="true">
              <path d="M12 4v11M7 11l5 5 5-5M5 20h14" />
            </svg>
            Resume
          </a>

          <!-- Mobile / tablet: menu button -->
          <button
            type="button"
            class="inline-flex h-11 w-11 items-center justify-center rounded-full text-(--color-text) transition-colors hover:text-(--color-primary-light) focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-(--color-primary) lg:hidden"
            :aria-expanded="isMenuOpen"
            aria-controls="mobile-nav"
            :aria-label="isMenuOpen ? 'Close menu' : 'Open menu'"
            @click="isMenuOpen = !isMenuOpen"
          >
            <svg
              v-if="!isMenuOpen"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.9"
              stroke-linecap="round"
              class="h-[22px] w-[22px]"
              aria-hidden="true"
            >
              <path d="M4 8h16M4 16h16" />
            </svg>
            <svg
              v-else
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.9"
              stroke-linecap="round"
              class="h-[22px] w-[22px]"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          <!-- Scroll progress -->
          <span
            class="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left bg-(--color-primary)"
            :style="{ transform: `scaleX(${progress})` }"
            aria-hidden="true"
          />
        </div>

        <!-- Mobile / tablet: slide-down panel -->
        <div
          id="mobile-nav"
          class="grid transition-[grid-template-rows] duration-300 ease-out lg:hidden"
          :class="isMenuOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
          :inert="!isMenuOpen"
        >
          <div class="overflow-hidden">
            <div class="px-2.5 pb-3 pt-1">
              <div class="mx-2.5 mb-2 h-px bg-(--color-secondary)/20" aria-hidden="true" />
              <ul class="flex flex-col">
                <li v-for="(link, i) in links" :key="link.href">
                  <a
                    :href="link.href"
                    :aria-current="active === i ? 'location' : undefined"
                    class="flex h-12 items-center justify-between rounded-2xl px-4 font-heading text-lg font-medium transition-colors hover:bg-(--color-secondary)/10 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-(--color-primary)"
                    :class="active === i ? 'bg-(--color-primary)/12 text-(--color-text)' : 'text-(--color-text-muted)'"
                    @click="closeMenu"
                  >
                    {{ link.label }}
                    <span
                      class="h-1.5 w-1.5 rounded-full"
                      :class="active === i ? 'bg-(--color-primary-light)' : 'bg-transparent'"
                      aria-hidden="true"
                    />
                  </a>
                </li>
              </ul>
              <a
                :href="profile.resumeUrl"
                target="_blank"
                rel="noopener"
                class="mx-1 mt-3 inline-flex h-[46px] w-[calc(100%-0.5rem)] items-center justify-center gap-2 rounded-full border border-(--color-secondary)/35 text-sm font-medium text-(--color-text) transition-colors hover:border-(--color-primary-light) hover:text-(--color-primary-light) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
                @click="closeMenu"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[15px] w-[15px]" aria-hidden="true">
                  <path d="M12 4v11M7 11l5 5 5-5M5 20h14" />
                </svg>
                Resume
              </a>
            </div>
          </div>
        </div>
      </nav>
    </div>
  </header>
</template>
