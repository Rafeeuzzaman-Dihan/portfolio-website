<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import profile from '~~/content/profile.json'
import type { Role } from '~/composables/useRoleTransition'

const roles = profile.roles as Role[]
const firstName = profile.name.replace(new RegExp(`\\s*${profile.nickname}$`), '')

// The keycaps on the buttons are real: Enter jumps to work, C to contact, while the hero is in view.
// Ignored while typing in a field, on a focused link/button (Enter already works there), or with modifiers.
function onKey(event: KeyboardEvent) {
  if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return
  const target = event.target
  if (target instanceof Element && target.closest('input, textarea, select, [contenteditable="true"], a, button')) return
  if (window.scrollY > window.innerHeight * 0.6) return

  const destination = event.key === 'Enter' ? '#projects' : event.key.toLowerCase() === 'c' ? '#contact' : null
  if (!destination) return
  event.preventDefault()
  const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  document.querySelector(destination)?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' })
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="relative flex min-h-screen flex-col overflow-hidden pb-8 pt-24 md:pb-14">
    <BackgroundsDotGridBackground />

    <!-- HUD corner marks, kept clear of the fixed header -->
    <div class="pointer-events-none" aria-hidden="true">
      <span class="absolute left-3 top-20 size-5 border-l border-t border-(--color-secondary)/45 sm:left-7 sm:top-24 sm:size-7" />
      <span class="absolute right-3 top-20 size-5 border-r border-t border-(--color-secondary)/45 sm:right-7 sm:top-24 sm:size-7" />
      <span class="absolute bottom-3 left-3 size-5 border-b border-l border-(--color-secondary)/45 sm:bottom-7 sm:left-7 sm:size-7" />
      <span class="absolute bottom-3 right-3 size-5 border-b border-r border-(--color-secondary)/45 sm:bottom-7 sm:right-7 sm:size-7" />
    </div>

    <div class="relative flex flex-1 items-center">
      <div class="section-container grid items-center gap-14 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-12">
        <div class="flex flex-col">
          <p class="flex items-center gap-3 font-heading text-lg font-medium leading-[1.2] text-(--color-text-muted) sm:text-xl lg:text-2xl">
            <span class="h-px w-7 bg-(--color-primary) sm:w-9" aria-hidden="true" />
            {{ profile.greeting }}
          </p>

          <!-- Stacked name: first name small and wide, the nickname huge in primary -->
          <h1 class="mt-4 flex flex-col gap-1.5" :aria-label="profile.name">
            <span class="first-name flex items-center gap-3.5 font-heading text-[clamp(0.95rem,1.6vw,1.35rem)] font-medium uppercase leading-none tracking-[0.42em] text-(--color-text)" aria-hidden="true">
              {{ firstName }}
            </span>
            <span class="nickname relative font-heading text-[clamp(4.5rem,13vw,8.5rem)] font-bold leading-[0.82] tracking-[-0.055em] text-(--color-primary)" aria-hidden="true">
              <span
                v-for="(letter, i) in profile.nickname"
                :key="i"
                class="inline-block"
                :style="{ '--i': i }"
              >{{ letter }}</span>
            </span>
          </h1>

          <RotatingRole
            :prefix="profile.rolePrefix"
            :roles="roles"
            class="mt-8 font-heading text-3xl font-medium sm:mt-8 sm:text-4xl lg:mt-10 xl:text-[2.75rem]"
          />

          <p class="mt-6 max-w-2xl text-base leading-relaxed text-(--color-text-muted) sm:text-lg md:mt-9">
            {{ profile.bio }}
          </p>

          <!-- Keycap buttons; the keys work too (Enter: View Work, C: Contact) -->
          <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-4 md:mt-8">
            <a href="#projects" class="key-btn is-primary" aria-keyshortcuts="Enter">
              <span class="keycap" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M20 4v7a4 4 0 0 1-4 4H4" /><path d="m9 10-5 5 5 5" /></svg>
              </span>
              View Work
            </a>
            <a href="#contact" class="key-btn is-secondary" aria-keyshortcuts="C">
              <span class="keycap" aria-hidden="true">C</span>
              Contact Me
            </a>
          </div>
        </div>

        <HeroDossierTerminal />
      </div>
    </div>

    <ScrollIndicator target="#expertise" class="relative mx-auto mt-10" />
  </div>
</template>

<style scoped>
.first-name::after {
  content: '';
  flex: 0 1 90px;
  height: 1px;
  background: linear-gradient(90deg, var(--color-border), transparent);
}

/* Letters drop in one by one, then a glowing bar draws under them */
.nickname > span {
  animation: drop 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  animation-delay: calc(0.25s + var(--i) * 60ms);
}

.nickname::after {
  content: '';
  position: absolute;
  bottom: -0.06em;
  left: 0.04em;
  width: 1.1em;
  height: 0.06em;
  background: var(--color-primary-light);
  box-shadow: 0 0 18px var(--color-primary);
  transform-origin: left;
  animation: bar 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 0.8s both;
}

@keyframes drop {
  from {
    opacity: 0;
    transform: translateY(-0.25em);
  }
}

@keyframes bar {
  from {
    transform: scaleX(0);
  }
}

/* Keycap buttons: the key hint is a real 3D keycap that presses down on hover */
.key-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 52px;
  padding: 0 22px 0 10px;
  border-radius: 10px;
  font: 600 15px/1 var(--font-body);
  transition:
    transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1),
    background-color 0.2s,
    border-color 0.2s,
    box-shadow 0.2s;
}

.keycap {
  --edge: color-mix(in srgb, var(--color-bg) 70%, black);

  display: inline-grid;
  place-items: center;
  min-width: 34px;
  height: 34px;
  padding: 0 8px;
  border-radius: 7px;
  font: 700 14px/1 var(--font-mono);
  box-shadow:
    0 3px 0 var(--edge),
    inset 0 1px 0 color-mix(in srgb, white 22%, transparent);
  transition:
    transform 0.12s,
    box-shadow 0.12s;
}

.keycap svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.key-btn:hover {
  transform: translateY(-2px);
}

.key-btn:hover .keycap,
.key-btn:active .keycap {
  transform: translateY(3px);
  box-shadow:
    0 0 0 var(--edge),
    inset 0 1px 0 color-mix(in srgb, white 22%, transparent);
}

.key-btn.is-primary {
  background: var(--color-primary);
  color: var(--color-bg);
  box-shadow: 0 14px 30px -14px var(--color-primary);
}

.key-btn.is-primary:hover {
  background: var(--color-primary-light);
}

.key-btn.is-primary .keycap {
  --edge: color-mix(in srgb, var(--color-primary) 50%, black);

  background: color-mix(in srgb, var(--color-primary) 78%, black);
  color: var(--color-text);
}

.key-btn.is-secondary {
  border: 1px solid color-mix(in srgb, var(--color-primary) 50%, transparent);
  color: var(--color-primary-light);
}

.key-btn.is-secondary:hover {
  border-color: var(--color-primary-light);
  background: color-mix(in srgb, var(--color-primary) 8%, transparent);
}

.key-btn.is-secondary .keycap {
  border: 1px solid color-mix(in srgb, var(--color-primary-light) 40%, transparent);
  background: var(--color-bg-elevated);
  color: var(--color-primary-light);
}

.key-btn:focus-visible {
  outline: 2px solid var(--color-primary-light);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .nickname > span,
  .nickname::after {
    animation: none;
  }

  .key-btn,
  .keycap {
    transition: none;
  }
}
</style>
