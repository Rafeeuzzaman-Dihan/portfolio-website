<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { Icon } from '@iconify/vue/offline'

const props = defineProps<{
  project: Project | null
  index: number
  total: number
}>()

const emit = defineEmits<{ close: [], next: [] }>()

const panel = ref<HTMLElement | null>(null)
const closeBtn = ref<HTMLButtonElement | null>(null)
const tech = computed(() => (props.project ? projectTech(props.project) : []))
const counter = computed(() => `${String(props.index + 1).padStart(2, '0')} / ${String(props.total).padStart(2, '0')}`)
const title = useDecodeText(() => props.project?.title ?? '')

const timeline = computed(() => {
  const project = props.project
  if (!project) return []
  const rows = project.releases.map(release => releaseLabel(release))
  return project.started ? [`Started ${formatMonthYear(project.started)}`, ...rows] : rows
})

let returnFocus: HTMLElement | null = null

// Opening: remember the trigger, lock page scroll, focus the close button and decode the title.
// Switching to the next case scrolls back to the top and decodes again.
watch(() => props.project, (project, previous) => {
  if (project && !previous) {
    returnFocus = document.activeElement as HTMLElement | null
    document.documentElement.style.overflow = 'hidden'
    nextTick(() => closeBtn.value?.focus())
  }
  if (!project && previous) {
    document.documentElement.style.overflow = ''
    returnFocus?.focus()
  }
  if (project) {
    nextTick(() => panel.value?.scrollTo({ top: 0 }))
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) title.reset()
    else title.decode(550)
  }
})

onBeforeUnmount(() => {
  document.documentElement.style.overflow = ''
})

// Keep Tab inside the panel while it is open; Escape closes it.
function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    emit('close')
    return
  }
  if (event.key !== 'Tab' || !panel.value) return
  const focusable = [...panel.value.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')]
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (!first || !last) return
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="case">
      <div v-if="project" class="fixed inset-0 z-[60] flex justify-end" @keydown="onKeydown">
        <div class="backdrop absolute inset-0 bg-(--color-bg)/80 backdrop-blur-sm" aria-hidden="true" @click="emit('close')" />

        <div
          ref="panel"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="`case-${project.slug}-title`"
          class="panel relative h-full w-full overflow-y-auto border-l border-(--color-border) bg-(--color-bg) md:max-w-[760px]"
        >
          <div class="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-(--color-border) bg-(--color-bg)/90 px-5 py-3.5 backdrop-blur sm:px-8">
            <span class="font-hud text-sm font-bold uppercase tracking-[0.18em] text-(--color-text-muted)">
              Case study <span class="text-(--color-primary-light)">· {{ counter }}</span>
            </span>
            <button
              ref="closeBtn"
              type="button"
              class="close flex items-center gap-2.5 px-3 py-2 font-hud text-sm font-bold uppercase tracking-[0.12em] text-(--color-text-muted)"
              @click="emit('close')"
            >
              <span class="hidden rounded-[3px] border border-(--color-border) px-1.5 py-0.5 font-mono text-[10px] tracking-normal sm:inline">Esc</span>
              Close
              <Icon icon="lucide:x" class="size-4" aria-hidden="true" />
            </button>
          </div>

          <div :key="project.slug" class="content grid gap-9 px-5 pb-12 pt-6 sm:px-8">
            <div class="shot relative aspect-[16/9] overflow-hidden border border-(--color-border)">
              <img :src="project.image" :alt="`${project.title} preview`" class="size-full object-cover object-top">
              <span class="corner" aria-hidden="true"><i /><i /><i /><i /></span>
            </div>

            <header class="grid gap-3">
              <span class="font-hud text-sm font-bold uppercase tracking-[0.18em] text-(--color-primary-light)">{{ project.category }}</span>
              <h2 :id="`case-${project.slug}-title`" class="font-heading text-[clamp(2rem,5vw,2.75rem)] font-bold leading-[1.05] tracking-[-0.03em] text-(--color-text)">
                <span class="sr-only">{{ project.title }}</span>
                <span aria-hidden="true">{{ title.shown.value }}</span>
              </h2>
              <p class="text-lg leading-relaxed text-(--color-text-muted)">
                {{ project.summary }}
              </p>
            </header>

            <dl class="facts grid gap-px border border-(--color-border) bg-(--color-border) sm:grid-cols-2">
              <div class="fact">
                <dt>Client</dt>
                <dd>{{ project.caseStudy.client }}</dd>
              </div>
              <div class="fact">
                <dt>My role</dt>
                <dd>{{ project.caseStudy.role }}</dd>
              </div>
              <div class="fact">
                <dt>Timeline</dt>
                <dd>
                  <span v-for="row in timeline" :key="row" class="block">{{ row }}</span>
                </dd>
              </div>
              <div class="fact">
                <dt>Status</dt>
                <dd class="flex items-center gap-2" :class="project.status === 'live' ? 'text-(--color-primary-light)' : ''">
                  <span class="size-1.5 bg-current" aria-hidden="true" />
                  {{ project.status === 'live' ? 'Live' : project.lockLabel }}
                  <span v-if="project.status === 'classified'" class="text-(--color-text-muted)">· client work under NDA</span>
                </dd>
              </div>
            </dl>

            <section class="block-section">
              <h3>Overview</h3>
              <p>{{ project.caseStudy.overview }}</p>
            </section>

            <section class="block-section">
              <h3>The challenge</h3>
              <p>{{ project.caseStudy.challenge }}</p>
            </section>

            <section class="block-section">
              <h3>What I built</h3>
              <ul>
                <li v-for="item in project.caseStudy.built" :key="item">
                  {{ item }}
                </li>
              </ul>
            </section>

            <section class="block-section">
              <h3>Under the hood</h3>
              <ul>
                <li v-for="item in project.caseStudy.underTheHood" :key="item">
                  {{ item }}
                </li>
              </ul>
              <ul class="stack mt-5 flex flex-wrap gap-2" aria-label="Tech stack">
                <li
                  v-for="tool in tech"
                  :key="tool.name"
                  class="tool flex items-center gap-2 border border-(--color-border) bg-(--color-bg-elevated) px-3 py-2 font-mono text-xs font-medium text-(--color-text-muted)"
                  :style="{ '--brand': tool.brand }"
                >
                  <Icon :icon="tool.icon" class="size-5 shrink-0" aria-hidden="true" />
                  {{ tool.name }}
                </li>
              </ul>
            </section>

            <section class="block-section">
              <h3>Outcome</h3>
              <p>{{ project.caseStudy.outcome }}</p>
            </section>

            <div class="flex flex-wrap gap-3 border-t border-(--color-border) pt-7">
              <a
                v-if="project.liveUrl"
                :href="project.liveUrl"
                target="_blank"
                rel="noopener"
                class="primary-btn flex h-12 items-center gap-2.5 px-5"
              >
                <span class="relative">See it live</span>
                <Icon icon="lucide:arrow-up-right" class="arrow relative size-4" aria-hidden="true" />
              </a>
              <span v-else class="lock-note flex h-12 items-center gap-2.5 px-4">
                <Icon icon="lucide:lock" class="size-4" aria-hidden="true" />
                {{ project.status === 'classified' ? 'No public link: client work under NDA' : 'Public link coming soon' }}
              </span>
              <button v-if="total > 1" type="button" class="next-btn ml-auto flex h-12 items-center gap-2.5 px-5" @click="emit('next')">
                Next case
                <Icon icon="lucide:arrow-right" class="arrow size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.close {
  transition: color 0.2s;
}

.close:hover,
.close:focus-visible {
  color: var(--color-text);
}

.corner i {
  position: absolute;
  width: 14px;
  height: 14px;
  border: 0 solid var(--color-primary);
}

.corner i:nth-child(1) {
  top: 10px;
  left: 10px;
  border-top-width: 2px;
  border-left-width: 2px;
}

.corner i:nth-child(2) {
  top: 10px;
  right: 10px;
  border-top-width: 2px;
  border-right-width: 2px;
}

.corner i:nth-child(3) {
  bottom: 10px;
  left: 10px;
  border-bottom-width: 2px;
  border-left-width: 2px;
}

.corner i:nth-child(4) {
  right: 10px;
  bottom: 10px;
  border-right-width: 2px;
  border-bottom-width: 2px;
}

.fact {
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  background: var(--color-bg);
}

.fact dt {
  font: 700 12px/1 var(--font-hud);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.fact dd {
  font-size: 15px;
  line-height: 1.5;
  color: var(--color-text);
}

.block-section {
  display: grid;
  gap: 12px;
}

.block-section h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  font: 700 14px/1 var(--font-hud);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-primary-light);
}

.block-section h3::before {
  content: '';
  width: 8px;
  height: 8px;
  background: var(--color-primary);
}

.block-section p {
  font-size: 16px;
  line-height: 1.75;
  color: var(--color-text-muted);
}

.block-section > ul:not(.stack) {
  display: grid;
  gap: 10px;
}

.block-section > ul:not(.stack) li {
  position: relative;
  padding-left: 22px;
  font-size: 15.5px;
  line-height: 1.65;
  color: var(--color-text-muted);
}

.block-section > ul:not(.stack) li::before {
  content: '';
  position: absolute;
  top: 0.62em;
  left: 2px;
  width: 8px;
  height: 2px;
  background: var(--color-primary-light);
}

.tool {
  transition:
    border-color 0.3s,
    color 0.3s;
}

.tool:hover {
  border-color: var(--brand);
  color: var(--color-text);
}

.primary-btn,
.next-btn,
.lock-note {
  font: 700 16px/1 var(--font-hud);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.primary-btn {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--color-primary);
  background: var(--color-primary);
  color: var(--color-text);
  transition: background-color 0.2s;
}

.primary-btn:hover,
.primary-btn:focus-visible {
  background: var(--color-primary-light);
}

.next-btn {
  border: 1px solid color-mix(in srgb, var(--color-text) 30%, transparent);
  color: var(--color-text);
  cursor: pointer;
  transition:
    border-color 0.2s,
    color 0.2s;
}

.next-btn:hover,
.next-btn:focus-visible {
  border-color: var(--color-primary-light);
  color: var(--color-primary-light);
}

.arrow {
  transition: transform 0.3s cubic-bezier(0.3, 1.5, 0.5, 1);
}

.next-btn:hover .arrow,
.next-btn:focus-visible .arrow {
  transform: translateX(5px);
}

.primary-btn:hover .arrow,
.primary-btn:focus-visible .arrow {
  transform: translate(3px, -3px);
}

.lock-note {
  border: 1px dashed color-mix(in srgb, var(--color-secondary) 40%, transparent);
  color: var(--color-text-muted);
  font-size: 14px;
}

/* The panel slides in from the right over a dimmed page; its content rises in. */
.case-enter-active,
.case-leave-active {
  transition: opacity 0.3s;
}

.case-enter-active .panel,
.case-leave-active .panel {
  transition: transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.case-enter-from,
.case-leave-to {
  opacity: 0;
}

.case-enter-from .panel,
.case-leave-to .panel {
  transform: translateX(100%);
}

.content > * {
  animation: rise 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.content > *:nth-child(1) { animation-delay: 0.1s; }
.content > *:nth-child(2) { animation-delay: 0.16s; }
.content > *:nth-child(3) { animation-delay: 0.22s; }
.content > *:nth-child(4) { animation-delay: 0.28s; }
.content > *:nth-child(n + 5) { animation-delay: 0.34s; }

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .case-enter-active .panel,
  .case-leave-active .panel {
    transition: none;
  }

  .content > * {
    animation: none;
  }
}
</style>
