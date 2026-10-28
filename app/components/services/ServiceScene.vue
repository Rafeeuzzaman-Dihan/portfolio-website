<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps<{
  kind: 'saas' | 'shop' | 'business' | 'mvp' | 'web'
  label: string
  counter: string
}>()

// Each picture is a tiny playable demo of its service. It plays itself while nobody touches it, and a click (or Enter) takes over.
const { el, onScreen } = useOnScreen()
const reduced = ref(false)
const touched = ref(false)
const ripples = ref<{ id: number, x: number, y: number }[]>([])
const floaters = ref<{ id: number, x: number, y: number, text: string }[]>([])
const toastKey = ref(0)
const toastText = ref('')
const mounted = ref(false)

let uid = 0
let lastTouch = 0
let auto: ReturnType<typeof setInterval> | undefined
const pending: ReturnType<typeof setTimeout>[] = []

function later(fn: () => void, ms: number) {
  pending.push(setTimeout(fn, ms))
}

function toast(text: string) {
  toastText.value = text
  toastKey.value++
}

function floatUp(at: { x: number, y: number } | undefined, text: string) {
  if (!at) return
  const id = ++uid
  floaters.value.push({ id, ...at, text })
  later(() => (floaters.value = floaters.value.filter(f => f.id !== id)), 900)
}

/* ---------- SaaS: add customers, revenue and the chart grow ---------- */
const mrr = ref(4280)
const subs = ref(412)
const series = ref([30, 38, 35, 52, 60, 72, 88])
const chart = computed(() => {
  const pts = series.value.map((v, i) => `${(i * 262 / (series.value.length - 1)).toFixed(1)} ${(96 - v * 0.8).toFixed(1)}`)
  const line = `M${pts.join(' L')}`
  return { line, area: `${line} L262 108 L0 108Z`, end: pts[pts.length - 1]!.split(' ').map(Number) as [number, number] }
})

function addCustomer(at?: { x: number, y: number }) {
  mrr.value += 29
  subs.value += 1
  const last = series.value[series.value.length - 1]!
  series.value = [...series.value.slice(1), last >= 88 ? 46 : last + 8]
  toast('New subscriber')
  floatUp(at, '+$29')
}

/* ---------- E-commerce: fill the cart, pay ---------- */
const products = [
  { name: 'Drill', price: 4200 },
  { name: 'Tool set', price: 1850 },
  { name: 'Vise', price: 3100 }
]
const qty = ref([0, 0, 0])
const phase = ref<'shop' | 'pay' | 'paid'>('shop')
const tileEls = ref<HTMLElement[]>([])
const cartEl = ref<HTMLElement | null>(null)
const fly = ref<{ id: number, sx: number, sy: number, dx: number, dy: number } | null>(null)
const bumped = ref(-1)
const cartCount = computed(() => qty.value.reduce((a, b) => a + b, 0))
const cartTotal = computed(() => qty.value.reduce((sum, n, i) => sum + n * products[i]!.price, 0))
const money = (n: number) => `৳${n.toLocaleString('en-US')}`
let autoProduct = 0

function addToCart(index: number) {
  if (phase.value !== 'shop') return
  qty.value = qty.value.map((n, i) => (i === index ? n + 1 : n))
  bumped.value = index
  later(() => (bumped.value = -1), 450)

  const scene = el.value?.getBoundingClientRect()
  const tile = tileEls.value[index]?.getBoundingClientRect()
  const cart = cartEl.value?.getBoundingClientRect()
  if (scene && tile && cart) {
    fly.value = {
      id: ++uid,
      sx: tile.left + tile.width / 2 - scene.left,
      sy: tile.top + 10 - scene.top,
      dx: cart.left + cart.width / 2 - (tile.left + tile.width / 2),
      dy: cart.top + cart.height / 2 - (tile.top + 10)
    }
  }
  if (cartCount.value >= 3) {
    phase.value = 'pay'
    later(pay, 3000)
  }
}

function pay() {
  if (phase.value !== 'pay') return
  phase.value = 'paid'
  toast('Order paid')
  later(() => {
    qty.value = [0, 0, 0]
    phase.value = 'shop'
  }, 1700)
}

/* ---------- Business software: stock sells down, low items get restocked ---------- */
const stock = ref([
  { name: 'Cement', v: 82 },
  { name: 'Steel rod', v: 55 },
  { name: 'Paint 4L', v: 14 },
  { name: 'Wire 2mm', v: 68 }
])
const lowCount = computed(() => stock.value.filter(s => s.v < 20).length)
let sellFrom = 0

function sell() {
  const open = stock.value.map((s, i) => ({ s, i })).filter(({ s }) => s.v >= 36)
  if (!open.length) return
  const pick = open[sellFrom++ % open.length]!
  stock.value[pick.i]!.v = Math.max(10, pick.s.v - 30)
}

function restock(index: number, at?: { x: number, y: number }) {
  const row = stock.value[index]
  if (!row) return
  row.v = 94
  toast(`Restocked: ${row.name}`)
  floatUp(at, '+ stock')
}

/* ---------- MVP: idea -> v0.1 -> launch -> v2 ---------- */
const steps = ['Idea', 'v0.1', 'Launch', 'v2']
const features = [
  { t: 'Core', at: 1 },
  { t: 'Login', at: 1 },
  { t: 'Checkout', at: 2 },
  { t: 'v2 ideas', at: 3 }
]
const step = ref(0)

function advance(at?: { x: number, y: number }) {
  step.value = (step.value + 1) % steps.length
  if (step.value === 2) {
    toast('Live')
    floatUp(at, 'LIVE')
  }
}

/* ---------- Website: desktop and phone ---------- */
const phoneFocus = ref(false)
const replay = ref(0)

function flip() {
  phoneFocus.value = !phoneFocus.value
  replay.value++
}

/* ---------- shared: pointer, keyboard, autoplay ---------- */
function act(at?: { x: number, y: number }, target?: HTMLElement | null) {
  if (props.kind === 'saas') addCustomer(at)
  else if (props.kind === 'shop') {
    if (phase.value === 'pay') return pay()
    const tile = target?.closest<HTMLElement>('[data-tile]')
    addToCart(tile ? Number(tile.dataset.tile) : autoProduct++ % products.length)
  }
  else if (props.kind === 'business') {
    const row = target?.closest<HTMLElement>('[data-row]')
    if (row) restock(Number(row.dataset.row), at)
    else {
      const lowest = stock.value.reduce((best, s, i) => (s.v < stock.value[best]!.v ? i : best), 0)
      restock(lowest, at)
    }
  }
  else if (props.kind === 'mvp') advance(at)
  else flip()
}

function onClick(event: MouseEvent) {
  const box = el.value?.getBoundingClientRect()
  if (!box) return
  const at = { x: event.clientX - box.left, y: event.clientY - box.top }
  touched.value = true
  lastTouch = Date.now()
  const id = ++uid
  ripples.value.push({ id, ...at })
  later(() => (ripples.value = ripples.value.filter(r => r.id !== id)), 750)
  act(at, event.target as HTMLElement)
}

function onKey() {
  touched.value = true
  lastTouch = Date.now()
  act({ x: 175, y: 84 })
}

const AUTO_MS = { saas: 3600, shop: 3000, business: 3400, mvp: 2300, web: 4800 } as const

function tick() {
  if (!onScreen.value || Date.now() - lastTouch < 6000) return
  if (props.kind === 'saas') addCustomer()
  else if (props.kind === 'shop') addToCart(autoProduct++ % products.length)
  else if (props.kind === 'business') {
    sell()
    const low = stock.value.findIndex(s => s.v < 20)
    if (low >= 0) later(() => restock(low), 1500)
  }
  else if (props.kind === 'mvp') advance()
  else flip()
}

const action = computed(() => ({
  saas: '+ Customer',
  shop: 'Add item',
  business: 'Restock',
  mvp: 'Next step',
  web: 'Switch'
})[props.kind])

const ariaLabel = computed(() => `${props.label} demo. Press to try it: ${action.value}.`)

onMounted(() => {
  reduced.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  nextTick(() => later(() => (mounted.value = true), 120))
  if (!reduced.value) auto = setInterval(tick, AUTO_MS[props.kind])
})

onBeforeUnmount(() => {
  clearInterval(auto)
  pending.forEach(clearTimeout)
})
</script>

<template>
  <div
    ref="el"
    class="vis relative h-[168px] cursor-pointer overflow-hidden border-b border-(--color-border) bg-(--color-bg) focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--color-primary-light)"
    :class="{ paused: !onScreen, touched, paying: kind === 'shop' && phase === 'pay' }"
    role="button"
    tabindex="0"
    :aria-label="ariaLabel"
    @click="onClick"
    @keydown.enter.prevent="onKey"
    @keydown.space.prevent="onKey"
  >
    <div class="scene" :class="kind">
      <div class="vtop"><span>{{ counter }}</span><b :class="{ 'mr-[42px]': kind === 'shop' }">{{ label }}</b></div>

      <!-- SaaS -->
      <template v-if="kind === 'saas'">
        <div class="mrr">
          <small>MRR</small>
          <span :key="mrr" class="mrr-value">${{ mrr.toLocaleString('en-US') }}</span>
          <em>{{ subs }} subscribers</em>
        </div>
        <svg viewBox="0 0 280 108" preserveAspectRatio="none" aria-hidden="true">
          <path class="area" :d="chart.area" />
          <path :key="toastKey" class="line" :d="chart.line" />
          <circle class="dot" :cx="chart.end[0]" :cy="chart.end[1]" r="3.5" />
          <circle :key="`p${toastKey}`" class="ping" :cx="chart.end[0]" :cy="chart.end[1]" r="6" :style="{ transformOrigin: `${chart.end[0]}px ${chart.end[1]}px` }" />
        </svg>
      </template>

      <!-- E-commerce -->
      <template v-else-if="kind === 'shop'">
        <div ref="cartEl" class="cart" :class="{ full: phase !== 'shop' }">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 4h2l2.4 11h10.2l2-8H6.2" /><circle cx="9" cy="19" r="1.6" /><circle cx="17" cy="19" r="1.6" /></svg>
          <b :key="cartCount" class="n">{{ cartCount }}</b>
        </div>
        <div class="tiles">
          <div
            v-for="(product, index) in products"
            :key="product.name"
            :ref="node => { if (node) tileEls[index] = node as HTMLElement }"
            class="tl"
            :class="{ bump: bumped === index, has: qty[index]! > 0 }"
            :data-tile="index"
          >
            <span>{{ product.name }}</span>
            <em>{{ money(product.price) }}</em>
            <i v-if="qty[index]! > 0" class="q">×{{ qty[index] }}</i>
          </div>
        </div>
        <div class="foot">
          <span>Cart · {{ cartCount }} {{ cartCount === 1 ? 'item' : 'items' }} · {{ money(cartTotal) }}</span>
          <b v-if="phase === 'pay'" class="pay">Pay now</b>
        </div>
        <span v-if="fly" :key="fly.id" class="fly" :style="{ '--sx': `${fly.sx}px`, '--sy': `${fly.sy}px`, '--dx': `${fly.dx}px`, '--dy': `${fly.dy}px` }">+1</span>
      </template>

      <!-- Business software -->
      <template v-else-if="kind === 'business'">
        <div class="alerts" :class="{ ok: lowCount === 0 }">{{ lowCount === 0 ? 'All stocked' : `Low stock: ${lowCount}` }}</div>
        <div class="rows">
          <div v-for="(item, index) in stock" :key="item.name" class="row" :class="{ low: item.v < 20 }" :data-row="index">
            <span>{{ item.name }}</span>
            <u><i :style="{ width: mounted ? `${item.v}%` : '0%' }" /></u>
            <s>{{ Math.round(item.v * 5) }}</s>
            <b v-if="item.v < 20">Reorder</b>
          </div>
        </div>
      </template>

      <!-- MVP -->
      <template v-else-if="kind === 'mvp'">
        <div class="trk">
          <div class="fillbar" :style="{ width: `${Math.min(step, 3) / 3 * 100}%` }" />
          <div class="live" :class="{ on: step >= 2 }">LIVE</div>
          <span
            v-for="(name, index) in steps"
            :key="name"
            class="nd"
            :class="[`n${index + 1}`, { lit: step >= index, hot: step === index }]"
            :style="{ left: `${index * 33.333}%` }"
          />
          <span
            v-for="(name, index) in steps"
            :key="`l${name}`"
            class="lb"
            :class="{ v2: index === 3, on: step >= index }"
            :style="{ left: `${index * 33.333}%` }"
          >{{ name }}</span>
        </div>
        <ul class="feat">
          <li v-for="feature in features" :key="feature.t" :class="{ done: step >= feature.at }">
            <i>{{ step >= feature.at ? '✓' : '' }}</i>{{ feature.t }}
          </li>
        </ul>
      </template>

      <!-- Website -->
      <template v-else>
        <div :key="`w${replay}`" class="win" :class="{ dim: phoneFocus }">
          <div class="bar"><i /><i /><i /><span class="url">yourbrand.com</span></div>
          <div class="pg">
            <b class="h" style="--i: 0.1s" /><b style="--i: 0.25s; width: 70%" /><b style="--i: 0.4s; width: 45%" />
            <div class="three"><b style="--i: 0.55s" /><b style="--i: 0.7s" /><b style="--i: 0.85s" /></div>
          </div>
        </div>
        <div :key="`p${replay}`" class="ph" :class="{ front: phoneFocus }"><b class="h" /><b /><b style="width: 60%" /><b style="width: 80%" /></div>
        <div :key="`s${phoneFocus}`" class="width">{{ phoneFocus ? '375 px · phone' : '1280 px · desktop' }}</div>
      </template>

      <div v-if="kind !== 'shop'" :key="toastKey" class="toast" :class="{ on: toastKey > 0 }">{{ toastText }}</div>
      <div v-else :key="toastKey" class="toast shoptoast" :class="{ on: toastKey > 0 }">{{ toastText }}</div>
    </div>

    <span v-for="ripple in ripples" :key="ripple.id" class="ripple" :style="{ left: `${ripple.x}px`, top: `${ripple.y}px` }" aria-hidden="true" />
    <span v-for="item in floaters" :key="item.id" class="floater" :style="{ left: `${item.x}px`, top: `${item.y}px` }" aria-hidden="true">{{ item.text }}</span>

    <span class="hint" :class="{ idle: !touched }" aria-hidden="true">{{ touched ? action : 'Try it' }} <i>▸</i></span>
  </div>
</template>

<style scoped>
/* ---- Shared ---- */
.scene { position: absolute; inset: 0; padding: 38px 16px 14px; }

.vtop {
  position: absolute;
  inset: 12px 14px auto;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  font: 500 11px/1 var(--font-mono);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-secondary);
}

.vtop b { font-weight: 500; color: var(--color-text-muted); }

.hint {
  position: absolute;
  right: 12px;
  bottom: 10px;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  font: 600 11px/1 var(--font-mono);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text);
  background: color-mix(in srgb, var(--color-bg-elevated) 88%, transparent);
  border: 1px solid var(--color-border);
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 0.25s, transform 0.25s;
  pointer-events: none;
}

.hint i { font-style: normal; color: var(--color-primary-light); }
.vis:hover .hint, .vis:focus-visible .hint { opacity: 1; transform: none; }
.vis.paying .hint { display: none; }
.hint.idle { opacity: 1; transform: none; animation: nudge 2.4s ease-in-out infinite; }
.vis:hover .hint.idle { animation: none; }

@keyframes nudge {
  0%, 70%, 100% { transform: none; }
  80% { transform: translateX(-4px); }
  90% { transform: translateX(0); }
}

.ripple {
  position: absolute;
  z-index: 5;
  width: 14px;
  height: 14px;
  margin: -7px 0 0 -7px;
  pointer-events: none;
  border: 2px solid var(--color-primary-light);
  border-radius: 50%;
  animation: ripple 0.75s ease-out forwards;
}

@keyframes ripple {
  to { transform: scale(9); opacity: 0; }
}

.floater {
  position: absolute;
  z-index: 6;
  font: 700 13px/1 var(--font-mono);
  color: var(--color-live);
  pointer-events: none;
  animation: floater 0.9s ease-out forwards;
}

@keyframes floater {
  from { transform: translate(-50%, -4px); opacity: 1; }
  to { transform: translate(-50%, -44px); opacity: 0; }
}

.toast {
  position: absolute;
  top: 34px;
  right: 14px;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  font: 500 11px var(--font-mono);
  color: var(--color-live);
  background: var(--color-bg);
  border: 1px solid var(--color-live);
  opacity: 0;
  transform: translateY(6px);
}

.toast::before { content: ''; width: 5px; height: 5px; background: currentcolor; border-radius: 50%; }
.toast.on { animation: toast 2.2s ease forwards; }

@keyframes toast {
  0% { opacity: 0; transform: translateY(6px); }
  12%, 78% { opacity: 1; transform: none; }
  100% { opacity: 0; transform: translateY(-4px); }
}

/* ---- 1 SaaS ---- */
.mrr { position: absolute; top: 30px; left: 16px; z-index: 2; font: 600 22px/1 var(--font-heading); letter-spacing: -0.02em; }
.mrr small { display: block; margin-bottom: 4px; font: 500 11px var(--font-mono); letter-spacing: 0.14em; color: var(--color-secondary); }
.mrr em { display: block; margin-top: 6px; font: 500 11px var(--font-mono); font-style: normal; letter-spacing: 0; color: var(--color-text-muted); }
.mrr-value { display: inline-block; animation: pop 0.5s ease; }

@keyframes pop {
  40% { color: var(--color-live); transform: scale(1.07); }
}

.saas svg { position: absolute; right: 0; bottom: 0; left: 0; width: 100%; height: 108px; }
.saas .area { fill: var(--color-primary); opacity: 0.12; transition: d 0.5s; }

.saas .line {
  fill: none;
  stroke: var(--color-primary-light);
  stroke-width: 2;
  stroke-dasharray: 420;
  animation: draw 0.9s ease-out both;
}

@keyframes draw {
  from { stroke-dashoffset: 420; }
  to { stroke-dashoffset: 0; }
}

.saas .dot { fill: var(--color-text); }
.saas .ping { fill: none; stroke: var(--color-live); animation: ping 1s ease-out both; }

@keyframes ping {
  from { opacity: 1; transform: scale(0.4); }
  to { opacity: 0; transform: scale(2.8); }
}

/* ---- 2 E-commerce ---- */
.shop .tiles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; height: 92px; padding-top: 4px; }

.shop .tl {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 2px;
  padding: 8px;
  font: 500 11px var(--font-mono);
  color: var(--color-text-muted);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
}

.shop .tl::before { content: ''; flex: 1; margin-bottom: 4px; background: color-mix(in srgb, var(--color-secondary) 14%, transparent); transition: background 0.25s; }
.shop .tl:hover { border-color: var(--color-primary); transform: translateY(-3px); }
.shop .tl.has { border-color: color-mix(in srgb, var(--color-primary) 60%, transparent); }
.shop .tl.has::before { background: color-mix(in srgb, var(--color-primary) 26%, transparent); }
.shop .tl.bump { animation: bump 0.45s ease; }
.shop .tl em { font-style: normal; color: var(--color-text); }
.shop .tl .q { position: absolute; top: 6px; right: 6px; padding: 1px 5px; font: 600 11px var(--font-mono); font-style: normal; color: var(--on-accent); background: var(--color-primary); }

@keyframes bump {
  40% { transform: translateY(-6px) scale(1.04); box-shadow: 0 0 18px -4px var(--color-primary); }
}

.cart {
  position: absolute;
  top: 28px;
  right: 14px;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  color: var(--color-text-muted);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  transition: border-color 0.3s, color 0.3s;
}

.cart.full { color: var(--color-live); border-color: var(--color-live); }
.cart svg { width: 16px; height: 16px; }

.cart .n {
  position: absolute;
  top: -9px;
  right: -9px;
  width: 17px;
  height: 17px;
  font: 600 11px/17px var(--font-mono);
  text-align: center;
  color: var(--on-accent);
  background: var(--color-primary);
  border-radius: 50%;
  animation: pop-n 0.4s cubic-bezier(0.3, 1.8, 0.5, 1);
}

@keyframes pop-n {
  from { transform: scale(0.4); }
}

.shop .foot {
  position: absolute;
  right: 14px;
  bottom: 10px;
  left: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font: 500 11px var(--font-mono);
  color: var(--color-text-muted);
}

.shop .pay { padding: 3px 8px; font: 600 11px var(--font-mono); color: var(--on-accent); background: var(--color-live); animation: pulse 0.9s ease-in-out infinite; }

@keyframes pulse {
  50% { transform: scale(1.06); }
}

.fly {
  position: absolute;
  top: var(--sy);
  left: var(--sx);
  z-index: 4;
  font: 700 12px var(--font-mono);
  color: var(--color-primary-light);
  pointer-events: none;
  animation: flyto 0.7s ease-in forwards;
}

@keyframes flyto {
  to { transform: translate(var(--dx), var(--dy)) scale(0.6); opacity: 0; }
}

.shoptoast { top: auto; right: auto; bottom: 34px; left: 16px; }

/* ---- 3 Business software ---- */
.alerts { position: absolute; bottom: 12px; left: 16px; z-index: 3; font: 600 11px/1 var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-alert); }
.alerts.ok { color: var(--color-live); }

.business .rows { display: grid; gap: 7px; padding-top: 4px; font: 500 11px var(--font-mono); color: var(--color-text-muted); }

.business .row {
  position: relative;
  display: grid;
  grid-template-columns: 70px 1fr 34px;
  gap: 10px;
  align-items: center;
  padding: 2px 4px;
  margin: 0 -4px;
  transition: background 0.2s;
}

.business .row:hover { background: color-mix(in srgb, var(--color-primary) 10%, transparent); }

.business .row u { position: relative; height: 7px; overflow: hidden; background: color-mix(in srgb, var(--color-secondary) 16%, transparent); }
.business .row u i { position: absolute; inset: 0 auto 0 0; background: var(--color-primary); transition: width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), background 0.3s; }
.business .row.low u i { background: var(--color-alert); }
.business .row s { text-align: right; text-decoration: none; color: var(--color-text); }
.business .row.low s { color: var(--color-alert); animation: blink 1.2s steps(2) infinite; }

.business .row b {
  position: absolute;
  top: 50%;
  right: 42px;
  padding: 1px 6px;
  font: 600 11px var(--font-mono);
  color: var(--color-bg);
  background: var(--color-alert);
  transform: translateY(-50%);
  animation: blink 1.2s steps(2) infinite;
}

@keyframes blink {
  50% { opacity: 0.45; }
}

/* ---- 4 MVP ---- */
.mvp .trk { position: absolute; top: 56px; right: 24px; left: 24px; height: 2px; background: var(--color-border); }
.mvp .fillbar { position: absolute; inset: 0 auto 0 0; background: var(--color-text); transition: width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); }

.mvp .nd {
  position: absolute;
  top: -6px;
  width: 14px;
  height: 14px;
  margin-left: -7px;
  background: var(--color-bg);
  border: 2px solid var(--color-border);
  border-radius: 50%;
  transition: background 0.3s, border-color 0.3s, transform 0.3s;
}

.mvp .nd.lit { background: var(--color-text); border-color: var(--color-text); }
.mvp .nd.n3.lit { background: var(--color-live); border-color: var(--color-live); }
.mvp .nd.hot { transform: scale(1.35); }
.mvp .nd.n4 { border-color: var(--color-alert); border-style: dashed; }
.mvp .nd.n4.lit { background: var(--color-alert); border-style: solid; }

.mvp .nd.n4::after {
  content: '';
  position: absolute;
  inset: -5px;
  border: 1px solid var(--color-alert);
  border-radius: 50%;
  animation: ping-ring 2s infinite;
}

@keyframes ping-ring {
  from { opacity: 1; transform: scale(0.6); }
  to { opacity: 0; transform: scale(1.7); }
}

.mvp .lb { position: absolute; top: 14px; font: 500 11px var(--font-mono); white-space: nowrap; color: var(--color-secondary); transform: translateX(-50%); transition: color 0.3s; }
.mvp .lb.on { color: var(--color-text); }
.mvp .lb.v2 { color: var(--color-alert); }

.mvp .live {
  position: absolute;
  top: -36px;
  left: 66.666%;
  padding: 4px 8px;
  font: 600 11px var(--font-mono);
  letter-spacing: 0.12em;
  color: var(--color-bg);
  background: var(--color-live);
  opacity: 0;
  transform: translate(-50%, 8px) scale(0.8);
  transition: opacity 0.3s, transform 0.4s cubic-bezier(0.3, 1.6, 0.5, 1);
}

.mvp .live.on { opacity: 1; transform: translate(-50%, 0) scale(1); }

.mvp .feat {
  position: absolute;
  right: 14px;
  bottom: 36px;
  left: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.mvp .feat li {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 8px 3px 4px;
  font: 500 11px var(--font-mono);
  color: var(--color-secondary);
  border: 1px solid var(--color-border);
  transition: color 0.3s, border-color 0.3s, background 0.3s;
}

.mvp .feat li i { display: grid; place-items: center; width: 14px; height: 14px; font-size: 10px; font-style: normal; color: var(--color-bg); border: 1px solid var(--color-border); transition: background 0.3s, border-color 0.3s; }
.mvp .feat li.done { color: var(--color-text); border-color: color-mix(in srgb, var(--color-primary) 50%, transparent); background: color-mix(in srgb, var(--color-primary) 10%, transparent); }
.mvp .feat li.done i { background: var(--color-primary); border-color: var(--color-primary); color: var(--on-accent); }

/* ---- 5 Website ---- */
.web .win {
  position: absolute;
  top: 34px;
  bottom: 0;
  left: 16px;
  width: 66%;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-bottom: 0;
  transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.4s;
  transform-origin: left center;
}

.web .win.dim { opacity: 0.45; transform: scale(0.94); }
.web .bar { display: flex; align-items: center; gap: 4px; height: 18px; padding: 0 7px; border-bottom: 1px solid var(--color-border); }
.web .bar i { width: 5px; height: 5px; background: var(--color-border); border-radius: 50%; }

.web .url {
  width: 0;
  margin-left: 6px;
  overflow: hidden;
  font: 500 10px var(--font-mono);
  white-space: nowrap;
  color: var(--color-text-muted);
  border-right: 1px solid var(--color-primary-light);
  animation: type 2.4s steps(13) 0.2s forwards;
}

@keyframes type {
  to { width: 13ch; }
}

.web .pg { display: grid; gap: 6px; padding: 8px; }

.web .pg b {
  display: block;
  height: 8px;
  background: color-mix(in srgb, var(--color-secondary) 16%, transparent);
  opacity: 0;
  animation: blk 0.6s ease forwards;
  animation-delay: calc(0.5s + var(--i));
}

.web .pg b.h { height: 26px; background: color-mix(in srgb, var(--color-primary) 30%, transparent); }
.web .pg .three { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; }
.web .pg .three b { height: 20px; }

@keyframes blk {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: none; }
}

.web .ph {
  position: absolute;
  top: 46px;
  right: 18px;
  display: grid;
  align-content: start;
  gap: 5px;
  width: 56px;
  height: 104px;
  padding: 9px 6px 6px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-secondary);
  border-radius: 9px;
  transition: transform 0.55s cubic-bezier(0.3, 1.4, 0.5, 1), box-shadow 0.4s, border-color 0.4s;
  animation: phone-in 0.6s ease 1.3s both;
}

.web .ph.front { z-index: 3; transform: translate(-96px, -2px) scale(1.4) rotate(-4deg); border-color: var(--color-primary-light); box-shadow: 0 10px 30px -8px var(--color-primary); }
.web .ph b { display: block; height: 6px; background: color-mix(in srgb, var(--color-secondary) 16%, transparent); }
.web .ph b.h { height: 22px; background: color-mix(in srgb, var(--color-primary) 30%, transparent); }

@keyframes phone-in {
  from { opacity: 0; translate: 0 8px; }
}

.web .width { position: absolute; bottom: 10px; left: 16px; z-index: 3; padding: 3px 7px; font: 500 11px var(--font-mono); color: var(--color-text-muted); background: color-mix(in srgb, var(--color-bg) 85%, transparent); border: 1px solid var(--color-border); animation: pop-n 0.4s ease; }

/* Endless loops stop while the picture is scrolled out of view */
.paused,
.paused *,
.paused *::before,
.paused *::after { animation-play-state: paused !important; }

/* Reduced motion: every picture still works on click, just without the movement. */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }

  .web .url { width: 13ch; }
  .web .pg b, .web .ph { opacity: 1; }
  .hint.idle { opacity: 1; }
  .toast.on { opacity: 1; transform: none; }
  .saas .line { stroke-dashoffset: 0; }
}
</style>
