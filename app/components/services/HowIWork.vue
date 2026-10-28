<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Icon } from '@iconify/vue/offline'
import services from '~~/content/services.json'

const { process: how } = services
const count = how.steps.length
const mock = how.mock

const BUILD_TARGET = 62
const RING = 94.2 // circumference of the score rings (r = 15)

// While the section is pinned, vertical scrolling moves the steps sideways. One state drives both sides:
// the card in view decides what the product on the left shows.
const stage = ref(1)
const progress = ref(0)
const buildPercent = ref(0)
const trackHeight = ref(0)
const thumbWidth = ref(100)

const trackEl = ref<HTMLElement | null>(null)
const pinEl = ref<HTMLElement | null>(null)
const stripEl = ref<HTMLElement | null>(null)

let buildTimer: ReturnType<typeof setInterval> | undefined
let reduced = false
let frame = 0

function runBuild() {
  clearInterval(buildTimer)
  if (reduced) {
    buildPercent.value = BUILD_TARGET
    return
  }
  buildPercent.value = 0
  buildTimer = setInterval(() => {
    buildPercent.value = Math.min(BUILD_TARGET, buildPercent.value + 2)
    if (buildPercent.value >= BUILD_TARGET) clearInterval(buildTimer)
  }, 40)
}

watch(stage, (next) => {
  if (next === 2) runBuild()
})

const stuckTop = () => Number.parseFloat(getComputedStyle(pinEl.value!).top) || 0

function cardStep() {
  const strip = stripEl.value
  const card = strip?.querySelector<HTMLElement>('.sc')
  if (!strip || !card) return 0
  return card.offsetWidth + (Number.parseFloat(getComputedStyle(strip).columnGap) || 0)
}

// The track is exactly as tall as the stage plus the sideways distance, so scrolling down by N pixels moves the steps N pixels
// sideways and there is no empty runway once they have all passed.
function measure() {
  const strip = stripEl.value
  const pin = pinEl.value
  if (!strip || !pin) return
  trackHeight.value = pin.offsetHeight + (strip.scrollWidth - strip.clientWidth)
  thumbWidth.value = (strip.clientWidth / strip.scrollWidth) * 100
  update()
}

function update() {
  frame = 0
  const track = trackEl.value
  const pin = pinEl.value
  const strip = stripEl.value
  if (!track || !pin || !strip) return

  const travel = track.offsetHeight - pin.offsetHeight
  const raw = travel > 0 ? (stuckTop() - track.getBoundingClientRect().top) / travel : 0
  progress.value = Math.min(1, Math.max(0, raw))

  const max = strip.scrollWidth - strip.clientWidth
  strip.scrollLeft = progress.value * max
  // The last card cannot reach the left edge, so the end of the strip counts as the last step.
  const atEnd = strip.scrollLeft >= max - 4
  const index = atEnd ? count - 1 : Math.round(strip.scrollLeft / (cardStep() || 1))
  stage.value = Math.min(count, Math.max(1, index + 1))
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(update)
}

// The step pills scroll the page to the spot where that card is in view.
function go(index: number) {
  const track = trackEl.value
  const strip = stripEl.value
  if (!track || !strip) return
  const max = strip.scrollWidth - strip.clientWidth
  const target = Math.min(Math.max(index, 0), count - 1) * cardStep()
  const share = max > 0 ? Math.min(target, max) / max : 0
  const top = window.scrollY + track.getBoundingClientRect().top - stuckTop() + share * (track.offsetHeight - pinEl.value!.offsetHeight)
  window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' })
}

onMounted(() => {
  reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  measure()
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', measure)
  document.fonts?.ready.then(measure)
})

onBeforeUnmount(() => {
  clearInterval(buildTimer)
  cancelAnimationFrame(frame)
  window.removeEventListener('scroll', schedule)
  window.removeEventListener('resize', measure)
})

// The rail runs from the first step's centre to the last step's centre (four equal columns).
const railFill = () => progress.value * 100
const pad = (n: number) => String(n).padStart(2, '0')
</script>

<template>
  <div>
    <div ref="trackEl" :style="trackHeight ? { height: `${trackHeight}px` } : undefined">
      <!-- The title travels with the pinned stage; the content sits right under it, no empty bands between. -->
      <div ref="pinEl" class="sticky top-20 flex flex-col gap-5 pb-4 lg:gap-8">
        <SectionTitle :text="how.title" :level="3" />

        <div
          class="grid w-full items-center gap-4 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] lg:gap-14"
          :data-stage="stage"
          :class="{ ge2: stage >= 2, ge3: stage >= 3 }"
          :style="{ '--p': progress }"
        >
          <!-- The product being built. It settles as the project does: the window tilts toward you and straightens by launch. -->
          <div class="stagewrap">
            <span class="reg tl" aria-hidden="true">+</span><span class="reg tr" aria-hidden="true">+</span>
            <span class="reg bl" aria-hidden="true">+</span><span class="reg br" aria-hidden="true">+</span>

            <div class="mock" aria-hidden="true">
              <div class="mrd"><span>Step <b>{{ stage }}</b> / {{ count }}</span><b>{{ how.steps[stage - 1]!.name }}</b></div>

              <div class="chrome">
                <i /><i /><i />
                <div class="urlbox">
                  <span class="u1">{{ mock.briefUrl }}</span>
                  <span class="u2">{{ mock.buildUrl }}</span>
                  <span class="u3"><span class="lock">●</span> {{ mock.liveUrl }}</span>
                </div>
              </div>

              <div class="pg">
                <!-- Navbar -->
                <div class="blk nav" style="--i: 0s">
                  <small class="dim">{{ mock.annotations.nav }}</small>
                  <div class="grp">
                    <div class="sk"><b class="w1" /><b class="w2" /><b class="w2" /></div>
                    <div class="tx"><strong>{{ mock.brand }}</strong><span v-for="link in mock.nav" :key="link">{{ link }}</span></div>
                  </div>
                </div>

                <!-- Hero -->
                <div class="blk hero" style="--i: 0.1s">
                  <small class="dim">{{ mock.annotations.hero }}</small>
                  <div class="grp">
                    <div class="sk"><b class="h" /><b class="w3" /><b class="w4" /></div>
                    <div class="tx"><h5>{{ mock.heroTitle }}</h5><p>{{ mock.heroText }}</p><em>{{ mock.cta }}</em></div>
                  </div>
                  <span class="art" />
                </div>

                <!-- Product grid -->
                <div class="cards3">
                  <div v-for="(product, index) in mock.products" :key="product.name" class="blk card" :class="{ pulse: index === 0 }" :style="{ '--i': `${0.2 + index * 0.12}s` }">
                    <small v-if="index === 0" class="dim">{{ mock.annotations.grid }}</small>
                    <div class="grp">
                      <div class="sk"><b class="w3" /><b class="w2" /></div>
                      <div class="tx"><strong>{{ product.name }}</strong><span>{{ product.price }}</span></div>
                    </div>
                    <span class="art" />
                  </div>
                </div>

                <div class="blk foot" style="--i: 0.55s"><small class="dim">{{ mock.annotations.footer }}</small></div>

                <!-- 1 Brief: what we agree on -->
                <div class="ov goals">
                  <small>{{ mock.goalsTitle }}</small>
                  <div v-for="(goal, index) in mock.goals" :key="goal">
                    <em :style="{ '--t': `${0.5 + index * 0.6}s` }" />{{ goal }}
                  </div>
                </div>

                <!-- 2 Build: code is written and the build bar fills -->
                <div class="ov code">
                  <div v-for="(line, index) in mock.code" :key="line" class="cl" :style="{ '--k': index, '--ch': `${line.length}ch` }"><span>{{ line }}</span></div>
                  <div class="cl done" :style="{ '--k': mock.code.length, '--ch': `${mock.codeDone.length + 3}ch` }"><span>✓ {{ mock.codeDone }}</span></div>
                </div>
                <div class="ov build">
                  <span><i>{{ mock.buildLabel }}</i><i>{{ buildPercent }}%</i></span>
                  <u><b :style="{ width: `${buildPercent}%` }" /></u>
                </div>

                <!-- 3 Ship: the deploy log runs, then the scores land -->
                <div class="ov deploy">
                  <div v-for="(line, index) in mock.deploy" :key="line" class="dl" :style="{ '--k': index }"><i>✓</i>{{ line }}</div>
                </div>
                <div class="ov gauges">
                  <div v-for="gauge in mock.gauges" :key="gauge.label" class="gauge">
                    <svg viewBox="0 0 36 36">
                      <circle class="track" cx="18" cy="18" r="15" />
                      <circle class="val" cx="18" cy="18" r="15" :style="{ '--off': RING * (1 - gauge.value / 100) }" />
                    </svg>
                    <b>{{ gauge.value }}</b>
                    <small>{{ gauge.label }}</small>
                  </div>
                </div>
                <div class="ov livepill">{{ mock.liveLabel }}</div>

                <!-- 4 Support: it stays up, orders keep coming, the next version is in progress -->
                <div class="ov mon">
                  <span>{{ mock.uptimeLabel }} <b>{{ mock.uptime }}</b></span>
                  <svg viewBox="0 0 120 26" preserveAspectRatio="none">
                    <polyline points="0,18 14,18 20,6 26,22 34,16 48,16 56,8 62,20 72,15 86,15 92,4 98,21 108,14 120,14" />
                  </svg>
                </div>
                <div class="ov order">{{ mock.order }}</div>
                <div class="ov ver"><i />{{ mock.version }}</div>
              </div>
            </div>
          </div>

          <div class="flex min-w-0 flex-col gap-4 lg:gap-6">
            <!-- Step rail: mirrors the sideways scroll, and each step is a shortcut -->
            <div class="relative">
              <div class="rail" aria-hidden="true"><span :style="{ width: `${railFill()}%` }" /></div>
              <ol class="grid grid-cols-4">
                <li v-for="(step, index) in how.steps" :key="step.name" class="pill" :class="{ on: stage === index + 1, done: stage > index + 1 }">
                  <button type="button" :aria-current="stage === index + 1 ? 'step' : undefined" @click="go(index)">
                    <span class="nd">{{ index + 1 }}</span>
                    <span class="nm">{{ step.name }}</span>
                  </button>
                </li>
              </ol>
            </div>

            <!-- The steps move sideways as the page scrolls; the card in view drives the window -->
            <div>
              <div ref="stripEl" class="strip" aria-label="Steps">
                <article v-for="(step, index) in how.steps" :key="step.name" class="sc" :class="{ on: stage === index + 1 }">
                  <span class="ghost" aria-hidden="true">{{ pad(index + 1) }}</span>
                  <span class="topline" aria-hidden="true" />
                  <div class="top">
                    <span class="ico"><Icon :icon="`solar:${step.icon}`" /></span>
                    <div class="pm">Step {{ index + 1 }} / {{ count }} · {{ step.when }}</div>
                  </div>
                  <h4>{{ step.name }}</h4>
                  <p>{{ step.text }}</p>
                </article>
              </div>

              <!-- Sideways scrollbar: the thumb shows how far through the steps you are -->
              <div class="sbar" role="progressbar" aria-label="Steps scrolled" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="Math.round(progress * 100)">
                <span class="thumb" :style="{ width: `${thumbWidth}%`, left: `${progress * (100 - thumbWidth)}%` }" />
              </div>

              <div class="mt-3 flex items-center justify-between gap-4">
                <p class="hint" :class="{ gone: progress > 0.02 }" aria-hidden="true">Keep scrolling to move through the steps <span>↓</span></p>
                <span class="pct ml-auto">{{ Math.round(progress * 100) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ---------- The window ---------- */
.stagewrap { position: relative; padding: 6px; }

/* Blueprint registration marks at the corners of the window */
.reg {
  position: absolute;
  font: 500 12px/1 var(--font-mono);
  color: var(--color-secondary);
  opacity: 0.7;
}

.reg.tl { top: -6px; left: -3px; }
.reg.tr { top: -6px; right: -3px; }
.reg.bl { bottom: -6px; left: -3px; }
.reg.br { right: -3px; bottom: -6px; }

.mock {
  position: relative;
  display: flex;
  flex-direction: column;
  height: clamp(176px, 27svh, 300px);
  overflow: hidden;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  box-shadow: 0 0 60px -26px var(--color-primary);
  transition: border-color 0.6s, box-shadow 0.6s;
}

[data-stage='3'] .mock,
[data-stage='4'] .mock {
  border-color: color-mix(in srgb, var(--color-primary) 35%, var(--color-border));
  box-shadow: 0 0 70px -22px var(--color-primary);
}

@media (height < 680px) and (width < 40rem) {
  .mock { height: 150px; }
}

@media (width >= 40rem) {
  .mock { height: clamp(300px, 36svh, 360px); }
}

/* On big screens the window grows with the screen height so the pinned stage fills it, and it settles (tilt to flat) as the project does. */
@media (width >= 64rem) {
  .stagewrap { perspective: 1400px; }

  .mock {
    height: clamp(400px, calc(100svh - 19rem), 540px);
    transform: rotateY(calc((1 - var(--p, 0)) * -7deg)) translateZ(0);
    transform-origin: 100% 50%;
  }
}

.mrd {
  display: flex;
  justify-content: space-between;
  padding: 9px 12px;
  font: 500 10px/1 var(--font-mono);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-secondary);
  border-bottom: 1px solid var(--color-border);
}

.mrd b { font-weight: 500; color: var(--color-text); }

.chrome {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
}

.chrome i { width: 7px; height: 7px; background: var(--color-border); border-radius: 50%; }

.urlbox {
  position: relative;
  display: grid;
  flex: 1;
  align-items: center;
  height: 18px;
  margin-left: 8px;
  padding: 0 8px;
  overflow: hidden;
  font: 500 10px var(--font-mono);
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
}

.urlbox > span {
  grid-area: 1 / 1;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s;
}

.urlbox .lock { color: var(--color-live); }

[data-stage='1'] .urlbox .u1,
[data-stage='2'] .urlbox .u2,
[data-stage='3'] .urlbox .u3,
[data-stage='4'] .urlbox .u3 { opacity: 1; }

/* The page: navbar, hero, product grid, footer */
.pg {
  position: relative;
  display: grid;
  flex: 1;
  grid-template-rows: 30px 1.3fr 1fr 18px;
  gap: 7px;
  min-height: 0;
  padding: 12px;
}

.blk {
  position: relative;
  display: flex;
  gap: 10px;
  min-width: 0;
  padding: 8px 10px;
  overflow: hidden;
  background: transparent;
  border: 1px dashed color-mix(in srgb, var(--color-primary) 55%, transparent);
  transition: background 0.6s, border-color 0.6s;
  transition-delay: var(--i, 0s);
}

.cards3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px; min-height: 0; }
.blk.nav { align-items: center; padding-block: 0; }
.blk.hero { align-items: stretch; justify-content: space-between; }
.blk.card { flex-direction: column; justify-content: space-between; }
.blk.foot { padding: 0; }

.ge2 .blk { background: var(--color-bg); border-style: solid; border-color: var(--color-border); }

.ge2 .blk.hero {
  background: color-mix(in srgb, var(--color-primary) 20%, var(--color-bg));
  border-color: color-mix(in srgb, var(--color-primary) 55%, transparent);
}

/* Blueprint labels, only while it is still a sketch */
.dim {
  position: absolute;
  top: 3px;
  right: 6px;
  z-index: 1;
  font: 500 8px/1 var(--font-mono);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-primary-light);
  opacity: 0;
  transition: opacity 0.4s;
}

[data-stage='1'] .dim { opacity: 0.9; }
.blk.foot .dim { top: 50%; right: auto; left: 8px; translate: 0 -50%; }

/* Each content group shows skeleton bars while building, then real text once styled */
.grp { display: grid; flex: 1; min-width: 0; align-content: start; }
.grp > * { grid-area: 1 / 1; min-width: 0; }
.blk.nav .grp { align-content: center; }

.sk { display: grid; gap: 5px; align-content: start; opacity: 0; transition: opacity 0.4s; transition-delay: calc(var(--i, 0s) + 0.2s); }
.blk.nav .sk { grid-auto-flow: column; justify-content: start; align-items: center; gap: 10px; }
.sk b { display: block; height: 5px; background: var(--color-text-muted); opacity: 0.55; }
.sk b.h { width: 62%; height: 9px; background: var(--color-text); opacity: 0.9; }
.sk b.w1 { width: 54px; height: 8px; background: var(--color-text); opacity: 0.9; }
.sk b.w2 { width: 28px; }
.sk b.w3 { width: 80%; }
.sk b.w4 { width: 46%; }
.ge2 .sk { opacity: 1; }
.ge3 .sk { opacity: 0; }

.tx { display: grid; gap: 4px; align-content: start; opacity: 0; transform: translateY(4px); transition: opacity 0.5s, transform 0.5s; transition-delay: calc(var(--i, 0s) + 0.25s); }
.ge3 .tx { opacity: 1; transform: none; }
.tx strong { font: 600 10px/1.15 var(--font-heading); color: var(--color-text); }
.tx span { font: 500 9px/1.2 var(--font-mono); color: var(--color-text-muted); }
.tx h5 { font: 700 clamp(13px, 1.5vw, 17px)/1.05 var(--font-heading); letter-spacing: -0.03em; color: var(--color-text); }
.tx p { font: 400 9px/1.3 var(--font-body); color: var(--color-text-muted); }
.tx em { justify-self: start; padding: 3px 8px; font: 600 9px/1 var(--font-mono); font-style: normal; color: var(--color-text); background: var(--color-primary); }
.blk.nav .tx { grid-auto-flow: column; justify-content: start; align-items: center; gap: 14px; }
.blk.nav .tx strong { margin-right: auto; font-size: 11px; }
.blk.nav .grp { width: 100%; }
.blk.nav .tx { width: 100%; grid-auto-flow: column; grid-template-columns: 1fr repeat(3, auto); }

/* Placeholder "photo" blocks: a flat tint with a drafting hatch, filled in once built */
.art {
  flex: none;
  background: transparent;
  border: 1px dashed color-mix(in srgb, var(--color-primary) 40%, transparent);
  transition: background 0.6s, border-color 0.6s;
}

.blk.hero .art { width: 38%; }
.blk.card .art { height: 42%; }
.ge2 .art { background: color-mix(in srgb, var(--color-primary) 16%, transparent); border-style: solid; border-color: var(--color-border); }

.ge3 .art {
  background:
    repeating-linear-gradient(135deg, transparent 0 5px, color-mix(in srgb, var(--color-primary) 22%, transparent) 5px 6px),
    color-mix(in srgb, var(--color-primary) 14%, transparent);
}

[data-stage='4'] .blk.pulse { animation: blkpulse 2s ease-in-out infinite; }

@keyframes blkpulse {
  50% { border-color: var(--color-alert); box-shadow: 0 0 14px -4px var(--color-alert); }
}

/* ---------- Overlays: one set per step ---------- */
.ov {
  position: absolute;
  z-index: 2;
  pointer-events: none;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.4s, transform 0.4s;
}

.goals {
  top: 50%;
  left: 50%;
  display: grid;
  gap: 9px;
  width: min(78%, 250px);
  padding: 12px;
  font: 500 11px var(--font-mono);
  color: var(--color-text);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-primary);
  box-shadow: 0 0 24px -8px var(--color-primary);
  translate: -50% -50%;
}

.goals small { font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--color-secondary); }
.goals div { display: flex; align-items: center; gap: 8px; }

.goals em {
  display: grid;
  flex: none;
  place-items: center;
  width: 11px;
  height: 11px;
  font-size: 9px;
  font-style: normal;
  line-height: 1;
  color: var(--color-bg);
  border: 1px solid var(--color-secondary);
}

.goals em::after { content: '✓'; opacity: 0; }

[data-stage='1'] .goals { opacity: 1; transform: none; }
[data-stage='1'] .goals em { animation: tick 0.3s ease forwards; animation-delay: var(--t); }
[data-stage='1'] .goals em::after { animation: show 0.01s forwards; animation-delay: var(--t); }

@keyframes tick {
  to { background: var(--color-primary); border-color: var(--color-primary); }
}

@keyframes show {
  to { opacity: 1; }
}

/* 2 Build */
.build {
  bottom: 12px;
  left: 12px;
  display: grid;
  gap: 6px;
  width: 44%;
  padding: 8px 10px;
  font: 500 9px var(--font-mono);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
}

.build span { display: flex; justify-content: space-between; }
.build i { font-style: normal; }
.build u { position: relative; height: 4px; overflow: hidden; background: var(--color-border); }
.build u b { position: absolute; inset: 0 auto 0 0; background: var(--color-primary); }

.code {
  right: 12px;
  bottom: 12px;
  display: grid;
  gap: 4px;
  width: 48%;
  padding: 8px 10px;
  font: 500 9px/1.3 var(--font-mono);
  color: var(--color-primary-light);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
}

.cl { width: 0; overflow: hidden; white-space: nowrap; }
.cl.done { color: var(--color-live); }

[data-stage='2'] .code,
[data-stage='2'] .build { opacity: 1; transform: none; }

[data-stage='2'] .cl {
  animation: typeline 0.55s steps(18) forwards;
  animation-delay: calc(0.3s + var(--k) * 0.7s);
}

@keyframes typeline {
  to { width: var(--ch); }
}

/* 3 Ship */
.deploy {
  bottom: 12px;
  left: 12px;
  display: grid;
  gap: 5px;
  width: 44%;
  padding: 8px 10px;
  font: 500 9px/1.2 var(--font-mono);
  color: var(--color-text-muted);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
}

.dl { display: flex; gap: 7px; opacity: 0; transform: translateX(-6px); }
.dl i { font-style: normal; color: var(--color-live); }

[data-stage='3'] .deploy { opacity: 1; transform: none; }

[data-stage='3'] .dl {
  animation: dlin 0.35s ease forwards;
  animation-delay: calc(0.3s + var(--k) * 0.45s);
}

@keyframes dlin {
  to { opacity: 1; transform: none; }
}

.gauges { right: 12px; bottom: 12px; display: flex; gap: 12px; padding: 8px 12px; background: var(--color-bg); border: 1px solid var(--color-border); }
[data-stage='3'] .gauges { opacity: 1; transform: none; }

.gauge { position: relative; display: grid; place-items: center; width: 46px; }
.gauge svg { grid-area: 1 / 1; width: 40px; height: 40px; transform: rotate(-90deg); }
.gauge circle { fill: none; stroke-width: 3; }
.gauge .track { stroke: var(--color-border); }
.gauge .val { stroke: var(--color-live); stroke-linecap: square; stroke-dasharray: 94.2; stroke-dashoffset: 94.2; }
.gauge b { grid-area: 1 / 1; font: 600 11px/1 var(--font-mono); color: var(--color-live); }
.gauge small { margin-top: 3px; font: 500 8px/1 var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-secondary); }
.gauge { grid-template-rows: 40px auto; }

[data-stage='3'] .gauge .val { animation: ring 1.2s ease forwards; animation-delay: 0.9s; }

@keyframes ring {
  to { stroke-dashoffset: var(--off); }
}

.livepill {
  top: 48px;
  right: 22px;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 9px;
  font: 600 10px/1 var(--font-mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-bg);
  background: var(--color-live);
  transform: scale(0.7);
}

.livepill::before {
  content: '';
  width: 6px;
  height: 6px;
  background: currentcolor;
  border-radius: 50%;
  animation: blink 1.4s infinite;
}

@keyframes blink {
  50% { opacity: 0.3; }
}

[data-stage='3'] .livepill,
[data-stage='4'] .livepill { opacity: 1; transform: none; }

/* 4 Support */
.mon {
  bottom: 12px;
  left: 12px;
  display: grid;
  gap: 6px;
  width: 44%;
  padding: 8px 10px;
  font: 500 9px/1 var(--font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
}

.mon b { color: var(--color-live); font-weight: 600; }
.mon svg { width: 100%; height: 26px; }

.mon polyline {
  fill: none;
  stroke: var(--color-live);
  stroke-width: 1.5;
  stroke-dasharray: 260;
  stroke-dashoffset: 260;
}

[data-stage='4'] .mon { opacity: 1; transform: none; }
[data-stage='4'] .mon polyline { animation: beat 3s linear infinite; }

@keyframes beat {
  0% { stroke-dashoffset: 260; }
  70%, 100% { stroke-dashoffset: 0; }
}

.order {
  top: 78px;
  right: 22px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 9px;
  font: 500 9px/1 var(--font-mono);
  color: var(--color-live);
  background: var(--color-bg);
  border: 1px solid var(--color-live);
}

.order::before { content: ''; width: 5px; height: 5px; background: currentcolor; border-radius: 50%; }
[data-stage='4'] .order { animation: orderpop 3.6s ease infinite; }

@keyframes orderpop {
  0%, 12% { opacity: 0; transform: translateY(8px); }
  22%, 70% { opacity: 1; transform: none; }
  82%, 100% { opacity: 0; transform: translateY(-4px); }
}

.ver {
  right: 12px;
  bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  font: 500 9px var(--font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-alert);
  background: var(--color-bg);
  border: 1px solid var(--color-alert);
}

.ver i { position: relative; width: 7px; height: 7px; border: 1px solid var(--color-alert); border-radius: 50%; }

.ver i::after {
  content: '';
  position: absolute;
  inset: -4px;
  border: 1px solid var(--color-alert);
  border-radius: 50%;
  animation: ping-ring 1.6s infinite;
}

@keyframes ping-ring {
  from { opacity: 1; transform: scale(0.6); }
  to { opacity: 0; transform: scale(1.7); }
}

[data-stage='4'] .ver { opacity: 1; transform: none; }

/* Small screens: keep the story, drop the secondary panels */
@media (width < 40rem) {
  .code,
  .gauges,
  .order,
  .blk.foot,
  .tx p { display: none; }

  .pg { grid-template-rows: 26px 1.2fr 1fr; padding: 8px; gap: 5px; }
  .build, .deploy, .mon { width: 62%; }
  .ver { right: 8px; bottom: 8px; }
}

/* ---------- Step rail ---------- */
.rail {
  position: absolute;
  top: 12px;
  right: 12.5%;
  left: 12.5%;
  height: 2px;
  background: var(--color-border);
}

.rail span {
  display: block;
  height: 100%;
  background: var(--color-primary);
  box-shadow: 0 0 10px var(--color-primary);
}

.pill { position: relative; }

.pill button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 0;
  cursor: pointer;
  background: none;
  border: 0;
}

.pill button:focus-visible { outline: 2px solid var(--color-primary-light); outline-offset: 4px; }
.pill button:hover .nm { color: var(--color-text); }

.nd {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  font: 600 11px var(--font-mono);
  color: var(--color-text-muted);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 50%;
  transition: all 0.4s;
}

.nm {
  font: 500 10px/1 var(--font-mono);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  transition: color 0.4s;
}

.pill.done .nd,
.pill.on .nd { color: var(--color-text); background: var(--color-primary); border-color: var(--color-primary); }
.pill.on .nd { box-shadow: 0 0 18px -2px var(--color-primary); }
.pill.on .nm { color: var(--color-text); }

/* ---------- The steps: a row of cards that moves sideways as the page scrolls (set from script) ---------- */
.strip {
  display: flex;
  gap: 12px;
  overflow-x: hidden;
}

.sc {
  position: relative;
  flex: 0 0 86%;
  min-height: clamp(150px, 24svh, 270px);
  padding: 20px 22px;
  overflow: hidden;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  opacity: 0.45;
  transition: opacity 0.4s, border-color 0.4s, box-shadow 0.4s;
}

/* Phones are short: tighter cards so the pinned stage always fits on screen, scrollbar included. */
@media (width < 40rem) {
  .sc { padding: 16px 18px; }
  .sc h4 { margin-top: 10px; }
  .sc p { margin-top: 8px; font-size: 0.92rem; }
  .ghost { top: auto; right: 12px; bottom: 4px; font-size: 3.2rem; }
}

@media (width >= 64rem) {
  .sc { padding: 24px; }
}

.sc.on {
  opacity: 1;
  border-color: color-mix(in srgb, var(--color-primary) 55%, transparent);
  box-shadow: 0 0 34px -16px var(--color-primary);
}

/* The accent line along the top draws across when a step becomes active */
.topline {
  position: absolute;
  top: -1px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--color-primary);
  box-shadow: 0 0 10px var(--color-primary);
  transition: width 0.7s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.sc.on .topline { width: 100%; }

/* A big outlined step number, like a stamped plate behind the text */
.ghost {
  position: absolute;
  top: 2px;
  right: 14px;
  font: 700 clamp(4rem, 8vw, 6rem) / 1 var(--font-heading);
  letter-spacing: -0.06em;
  color: transparent;
  pointer-events: none;
  -webkit-text-stroke: 1px color-mix(in srgb, var(--color-secondary) 28%, transparent);
  transition: -webkit-text-stroke-color 0.4s;
}

.sc.on .ghost { -webkit-text-stroke-color: color-mix(in srgb, var(--color-primary) 55%, transparent); }

.top { position: relative; display: flex; align-items: center; gap: 12px; }

.ico {
  display: grid;
  flex: none;
  place-items: center;
  width: 36px;
  height: 36px;
  font-size: 20px;
  color: var(--color-primary);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  transition: border-color 0.4s;
}

.sc.on .ico { border-color: var(--color-primary); }

.pm {
  font: 500 10px/1 var(--font-mono);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-secondary);
}

.sc h4 {
  position: relative;
  margin-top: 14px;
  font: 700 clamp(2rem, 5vw, 3.25rem) / 1 var(--font-heading);
  letter-spacing: -0.04em;
  color: var(--color-text);
}

.sc p { position: relative; margin-top: 12px; font-size: 1rem; color: var(--color-text-muted); }

/* ---------- Sideways scrollbar ---------- */
.sbar {
  position: relative;
  height: 6px;
  margin-top: 14px;
  background: var(--color-border);
}

.thumb {
  position: absolute;
  top: 0;
  bottom: 0;
  background: var(--color-primary);
  box-shadow: 0 0 10px var(--color-primary);
}

.pct {
  min-width: 3ch;
  font: 500 11px/1 var(--font-mono);
  letter-spacing: 0.08em;
  text-align: right;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

.hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font: 500 10px/1 var(--font-mono);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-secondary);
  transition: opacity 0.4s;
}

.hint span { display: inline-block; animation: nudge 1.4s ease-in-out infinite; }
.hint.gone { opacity: 0; }

@keyframes nudge {
  50% { transform: translateY(4px); }
}

/* Reduced motion: no tilt, no looping or typing animation; the finished state of each step shows. */
@media (prefers-reduced-motion: reduce) {
  .mock { transform: none; }
  .ov, .blk, .sk, .tx, .art, .urlbox > span, .nd, .nm, .sc, .topline, .ghost { transition: none; }
  .livepill::before, .ver i::after, .hint span, .mon polyline, .order, [data-stage='4'] .blk.pulse { animation: none; }
  .cl { width: var(--ch); animation: none !important; }
  .dl { opacity: 1; transform: none; animation: none !important; }
  .gauge .val { stroke-dashoffset: var(--off); animation: none !important; }
  .mon polyline { stroke-dashoffset: 0; }
  [data-stage='4'] .order { opacity: 1; transform: none; }
  .goals em { animation: none !important; background: var(--color-primary); border-color: var(--color-primary); }
  .goals em::after { animation: none !important; opacity: 1; }
}
</style>
