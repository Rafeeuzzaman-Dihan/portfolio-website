<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const { el, onScreen } = useOnScreen()

const props = defineProps<{
  kind: 'saas' | 'shop' | 'business' | 'mvp' | 'web'
  label: string
  counter: string
}>()

// The SaaS picture's revenue figure ticks up with each "New subscriber" toast (every 5s, in step with the CSS loop).
const mrr = ref(4280)
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (props.kind === 'saas' && !reduced) timer = setInterval(() => (mrr.value += 29), 5000)
})
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <div ref="el" class="vis relative h-[168px] overflow-hidden border-b border-(--color-border) bg-(--color-bg)" :class="{ paused: !onScreen }" aria-hidden="true">
    <div class="scene" :class="kind">
      <div class="vtop"><span>{{ counter }}</span><b :class="{ 'mr-[42px]': kind === 'shop' }">{{ label }}</b></div>

      <!-- SaaS: revenue line draws, a subscriber arrives, MRR ticks up -->
      <template v-if="kind === 'saas'">
        <div class="mrr">
          <small>MRR</small>
          <span :key="mrr" class="mrr-value">${{ mrr.toLocaleString('en-US') }}</span>
        </div>
        <div class="toast">New subscriber</div>
        <svg viewBox="0 0 280 108" preserveAspectRatio="none">
          <path class="area" d="M0 96 L40 84 L80 88 L120 66 L160 60 L200 40 L262 18 L280 18 L280 108 L0 108Z" />
          <path class="line" d="M0 96 L40 84 L80 88 L120 66 L160 60 L200 40 L262 18" />
          <circle class="dot" cx="262" cy="18" r="3.5" />
          <circle class="ping" cx="262" cy="18" r="6" />
        </svg>
      </template>

      <!-- E-commerce: a product is picked, +1 flies to the cart, the order is paid -->
      <template v-else-if="kind === 'shop'">
        <div class="cart">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 4h2l2.4 11h10.2l2-8H6.2" /><circle cx="9" cy="19" r="1.6" /><circle cx="17" cy="19" r="1.6" /></svg>
          <div class="n"><span class="a">0</span><span class="b">1</span></div>
        </div>
        <div class="tiles">
          <div class="tl"><span>Drill</span><em>৳4,200</em></div>
          <div class="tl hit"><span>Tool set</span><em>৳1,850</em></div>
          <div class="tl"><span>Vise</span><em>৳3,100</em></div>
        </div>
        <span class="plus">+1</span>
        <div class="toast">Order paid</div>
      </template>

      <!-- Business software: stock bars fill, the low row blinks amber, an invoice goes out -->
      <template v-else-if="kind === 'business'">
        <div class="rows">
          <div class="row"><span>Cement</span><u style="--w: 82%; --i: 0s" /><s>412</s></div>
          <div class="row"><span>Steel rod</span><u style="--w: 55%; --i: 0.15s" /><s>230</s></div>
          <div class="row low"><span>Paint 4L</span><u style="--w: 14%; --i: 0.3s" /><s>18</s></div>
          <div class="row"><span>Wire 2mm</span><u style="--w: 68%; --i: 0.45s" /><s>301</s></div>
        </div>
        <div class="toast">Invoice sent</div>
      </template>

      <!-- MVP: idea -> v0.1 -> launch (green, live) -> v2 (amber, in progress) -->
      <template v-else-if="kind === 'mvp'">
        <div class="trk">
          <div class="fillbar" />
          <div class="live">LIVE</div>
          <span class="nd n1" /><span class="nd n2" /><span class="nd n3" /><span class="nd n4" />
          <span class="lb" style="left: 0">Idea</span>
          <span class="lb" style="left: 33.3%">v0.1</span>
          <span class="lb" style="left: 66.6%">Launch</span>
          <span class="lb v2" style="left: 100%">v2</span>
        </div>
      </template>

      <!-- Website: the address types, the page builds block by block, the phone version follows -->
      <template v-else>
        <div class="win">
          <div class="bar"><i /><i /><i /><span class="url">yourbrand.com</span></div>
          <div class="pg">
            <b class="h" style="--i: 0.1s" /><b style="--i: 0.25s; width: 70%" /><b style="--i: 0.4s; width: 45%" />
            <div class="three"><b style="--i: 0.55s" /><b style="--i: 0.7s" /><b style="--i: 0.85s" /></div>
          </div>
        </div>
        <div class="ph"><b class="h" /><b /><b style="width: 60%" /></div>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* ---- Shared ---- */
.scene {
  position: absolute;
  inset: 0;
  padding: 38px 16px 14px;
}

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

.vtop b {
  font-weight: 500;
  color: var(--color-text-muted);
}

.toast {
  position: absolute;
  top: 34px;
  right: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  font: 500 10px var(--font-mono);
  color: var(--color-live);
  background: var(--color-bg);
  border: 1px solid var(--color-live);
  opacity: 0;
  transform: translateY(6px);
}

.toast::before {
  content: '';
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentcolor;
}

/* ---- 1 SaaS ---- */
.mrr {
  position: absolute;
  top: 32px;
  left: 16px;
  font: 600 22px/1 var(--font-heading);
  letter-spacing: -0.02em;
}

.mrr small {
  display: block;
  margin-bottom: 4px;
  font: 500 9px var(--font-mono);
  letter-spacing: 0.14em;
  color: var(--color-secondary);
}

.mrr-value {
  display: inline-block;
  animation: pop 0.5s ease;
}

@keyframes pop {
  40% { color: var(--color-live); transform: scale(1.06); }
}

.saas svg {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 108px;
}

.saas .area { fill: var(--color-primary); opacity: 0.12; }

.saas .line {
  fill: none;
  stroke: var(--color-primary-light);
  stroke-width: 2;
  stroke-dasharray: 400;
  stroke-dashoffset: 400;
  animation: draw 5s ease-in-out infinite;
}

@keyframes draw {
  0% { stroke-dashoffset: 400; }
  55%, 92% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: 0; opacity: 0; }
}

.saas .dot { fill: var(--color-text); animation: dotin 5s infinite; }

@keyframes dotin {
  0%, 50% { opacity: 0; }
  58%, 92% { opacity: 1; }
  100% { opacity: 0; }
}

.saas .ping {
  fill: none;
  stroke: var(--color-live);
  transform-origin: 262px 18px;
  animation: ping 5s infinite;
}

@keyframes ping {
  0%, 55% { opacity: 0; transform: scale(0.4); }
  62% { opacity: 1; }
  90% { opacity: 0; transform: scale(2.4); }
  100% { opacity: 0; }
}

.saas .toast { animation: toast-a 5s infinite; }

@keyframes toast-a {
  0%, 50% { opacity: 0; transform: translateY(6px); }
  58%, 85% { opacity: 1; transform: none; }
  94%, 100% { opacity: 0; }
}

/* ---- 2 E-commerce ---- */
.shop .tiles {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  height: 100%;
  padding-top: 8px;
}

.shop .tl {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 2px;
  padding: 8px;
  font: 500 10px var(--font-mono);
  color: var(--color-text-muted);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
}

.shop .tl::before {
  content: '';
  flex: 1;
  margin-bottom: 4px;
  background: color-mix(in srgb, var(--color-secondary) 12%, transparent);
}

.shop .tl em { font-style: normal; color: var(--color-text); }
.shop .tl.hit { animation: hit 6s infinite; }

@keyframes hit {
  0%, 12% { border-color: var(--color-border); transform: none; }
  18%, 34% { border-color: var(--color-primary); transform: translateY(-4px); box-shadow: 0 0 16px -4px var(--color-primary); }
  40%, 100% { border-color: var(--color-border); transform: none; box-shadow: none; }
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
}

.cart svg { width: 16px; height: 16px; }

.cart .n {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 16px;
  height: 16px;
  overflow: hidden;
  font: 600 9px/16px var(--font-mono);
  text-align: center;
  color: var(--color-text);
  background: var(--color-primary);
  border-radius: 50%;
}

.cart .n span { position: absolute; inset: 0; opacity: 0; }
.cart .n .a { animation: n0 6s infinite; }
.cart .n .b { animation: n1 6s infinite; }

@keyframes n0 {
  0%, 38% { opacity: 1; }
  40%, 100% { opacity: 0; }
}

@keyframes n1 {
  0%, 38% { opacity: 0; }
  40%, 92% { opacity: 1; }
  96%, 100% { opacity: 0; }
}

.plus {
  position: absolute;
  top: 100px;
  left: 50%;
  z-index: 2;
  font: 600 11px var(--font-mono);
  color: var(--color-primary-light);
  opacity: 0;
  animation: fly 6s infinite;
}

@keyframes fly {
  0%, 30% { opacity: 0; transform: translate(0, 0); }
  36% { opacity: 1; }
  48% { opacity: 0; transform: translate(70px, -62px); }
  100% { opacity: 0; }
}

.shop .toast { top: auto; bottom: 12px; animation: toast-b 6s infinite; }

@keyframes toast-b {
  0%, 55% { opacity: 0; transform: translateY(6px); }
  63%, 88% { opacity: 1; transform: none; }
  96%, 100% { opacity: 0; }
}

/* ---- 3 Business software ---- */
.business .rows {
  display: grid;
  gap: 9px;
  padding-top: 6px;
  font: 500 10px var(--font-mono);
  color: var(--color-text-muted);
}

.business .row {
  display: grid;
  grid-template-columns: 74px 1fr 34px;
  gap: 10px;
  align-items: center;
}

.business .row u {
  position: relative;
  height: 6px;
  overflow: hidden;
  background: color-mix(in srgb, var(--color-secondary) 14%, transparent);
}

.business .row u::after {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: var(--w);
  background: var(--color-primary);
  transform-origin: left;
  animation: fill 5s ease-in-out infinite;
  animation-delay: var(--i);
}

.business .row.low u::after { background: var(--color-alert); }

@keyframes fill {
  0% { transform: scaleX(0); }
  30%, 90% { transform: scaleX(1); }
  100% { transform: scaleX(0); }
}

.business .row s { text-align: right; text-decoration: none; color: var(--color-text); }
.business .row.low s { color: var(--color-alert); animation: blink 1.2s steps(2) infinite; }

@keyframes blink {
  50% { opacity: 0.35; }
}

.business .toast { top: auto; bottom: 12px; animation: toast-b 5s infinite; }

/* ---- 4 MVP ---- */
.mvp .trk {
  position: absolute;
  top: 78px;
  right: 24px;
  left: 24px;
  height: 2px;
  background: var(--color-border);
}

.mvp .fillbar {
  position: absolute;
  inset: 0 auto 0 0;
  width: 66.6%;
  background: var(--color-text);
  transform-origin: left;
  animation: grow 7s infinite;
}

@keyframes grow {
  0% { transform: scaleX(0); }
  55%, 92% { transform: scaleX(1); }
  100% { transform: scaleX(1); opacity: 0; }
}

.mvp .nd {
  position: absolute;
  top: -6px;
  width: 14px;
  height: 14px;
  margin-left: -7px;
  background: var(--color-bg);
  border: 2px solid var(--color-border);
  border-radius: 50%;
}

.mvp .nd.n1 { left: 0; animation: lit1 7s infinite; }
.mvp .nd.n2 { left: 33.3%; animation: lit2 7s infinite; }
.mvp .nd.n3 { left: 66.6%; animation: lit3 7s infinite; }

@keyframes lit1 {
  0%, 2% { background: var(--color-bg); border-color: var(--color-border); }
  6%, 92% { background: var(--color-text); border-color: var(--color-text); }
  100% { background: var(--color-bg); border-color: var(--color-border); }
}

@keyframes lit2 {
  0%, 20% { background: var(--color-bg); border-color: var(--color-border); }
  26%, 92% { background: var(--color-text); border-color: var(--color-text); }
  100% { background: var(--color-bg); border-color: var(--color-border); }
}

@keyframes lit3 {
  0%, 50% { background: var(--color-bg); border-color: var(--color-border); }
  56%, 92% { background: var(--color-live); border-color: var(--color-live); }
  100% { background: var(--color-bg); border-color: var(--color-border); }
}

.mvp .nd.n4 { left: 100%; border-color: var(--color-alert); border-style: dashed; }

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

.mvp .lb {
  position: absolute;
  top: 14px;
  font: 500 10px var(--font-mono);
  color: var(--color-text-muted);
  white-space: nowrap;
  transform: translateX(-50%);
}

.mvp .lb.v2 { color: var(--color-alert); }

.mvp .live {
  position: absolute;
  top: -40px;
  left: 66.6%;
  padding: 4px 8px;
  font: 600 10px var(--font-mono);
  letter-spacing: 0.12em;
  color: var(--color-bg);
  background: var(--color-live);
  opacity: 0;
  transform: translateX(-50%);
  animation: livepop 7s infinite;
}

@keyframes livepop {
  0%, 54% { opacity: 0; transform: translate(-50%, 8px) scale(0.8); }
  60%, 90% { opacity: 1; transform: translate(-50%, 0) scale(1); }
  97%, 100% { opacity: 0; }
}

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
}

.web .bar {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 18px;
  padding: 0 7px;
  border-bottom: 1px solid var(--color-border);
}

.web .bar i { width: 5px; height: 5px; background: var(--color-border); border-radius: 50%; }

.web .url {
  width: 0;
  margin-left: 6px;
  overflow: hidden;
  font: 500 8px var(--font-mono);
  white-space: nowrap;
  color: var(--color-text-muted);
  border-right: 1px solid var(--color-primary-light);
  animation: type 6s steps(13) infinite;
}

@keyframes type {
  0% { width: 0; }
  30%, 92% { width: 13ch; }
  100% { width: 13ch; opacity: 0; }
}

.web .pg { display: grid; gap: 6px; padding: 8px; }

.web .pg b {
  display: block;
  height: 8px;
  background: color-mix(in srgb, var(--color-secondary) 14%, transparent);
  opacity: 0;
  animation: blk 6s infinite;
  animation-delay: var(--i);
}

.web .pg b.h { height: 26px; background: color-mix(in srgb, var(--color-primary) 30%, transparent); }
.web .pg .three { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; }
.web .pg .three b { height: 20px; }

@keyframes blk {
  0%, 24% { opacity: 0; transform: translateY(6px); }
  34%, 92% { opacity: 1; transform: none; }
  100% { opacity: 0; }
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
  animation: phone 6s infinite;
}

.web .ph b { display: block; height: 6px; background: color-mix(in srgb, var(--color-secondary) 14%, transparent); }
.web .ph b.h { height: 22px; background: color-mix(in srgb, var(--color-primary) 30%, transparent); }

@keyframes phone {
  0%, 38% { opacity: 0.2; transform: translateY(6px); }
  48%, 92% { opacity: 1; transform: none; }
  100% { opacity: 0; }
}

/* Reduced motion: every picture shows its finished state. */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }

  .saas .line { stroke-dashoffset: 0; }
  .saas .dot, .saas .toast, .shop .toast, .business .toast, .mvp .live { opacity: 1; transform: none; }
  .mvp .live { transform: translateX(-50%); }
  .mvp .fillbar { transform: none; }
  .mvp .nd.n1, .mvp .nd.n2 { background: var(--color-text); border-color: var(--color-text); }
  .mvp .nd.n3 { background: var(--color-live); border-color: var(--color-live); }
  .business .row u::after { transform: none; }
  .shop .cart .n .b { opacity: 1; }
  .web .url { width: 13ch; }
  .web .pg b, .web .ph { opacity: 1; }
}

/* Endless loops stop while the picture is scrolled out of view */
.paused,
.paused *,
.paused *::before,
.paused *::after { animation-play-state: paused !important; }
</style>
