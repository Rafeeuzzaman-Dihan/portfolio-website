<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'
import profile from '~~/content/profile.json'
import type HoloKeyboard from './HoloKeyboard.vue'

const { dossier } = profile

const PASSPHRASE_LENGTH = 8
const DECRYPT_MS = 750
const LINE_STEP_MS = 150
const DECODE_MS = 450

const keyboard = ref<InstanceType<typeof HoloKeyboard> | null>(null)

// Sequence state: type command → type passphrase → decrypt → ACCESS GRANTED →
// keyboard dissolves → callsign glitches in → file lines decode from binary.
const command = ref('')
const passphrase = ref('')
const caretLine = ref(0)
const decrypting = ref(false)
const barFull = ref(false)
const granted = ref(false)
const lights = ref(0)
const keyboardGone = ref(false)
const fileShown = ref(false)

// Before decoding, a value shows as a same-length stream of 0s and 1s (spaces kept).
// The server renders a fixed pattern so hydration matches; live noise starts on mount.
const toBinary = (text: string, seed: number) =>
  text.replace(/[^ ]/g, (_match, offset: number) => ((offset * 7 + seed) % 3 === 0 ? '1' : '0'))
const noise = (text: string) => text.replace(/[^ ]/g, () => (Math.random() < 0.5 ? '0' : '1'))

const shown = ref(dossier.lines.map((line, i) => toBinary(line.value, i)))
const decoded = ref(dossier.lines.map(() => false))

let alive = true
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Types into the screen at a human, uneven rhythm, pressing the matching key each time.
async function typeInto(target: Ref<string>, text: string, masked: boolean) {
  for (const char of text) {
    await sleep(28 + Math.random() * 38)
    if (!alive) return
    keyboard.value?.pressChar(masked ? 'xkqzbvmw'[Math.floor(Math.random() * 8)]! : char)
    target.value += masked ? '*' : char
  }
  await sleep(120)
  keyboard.value?.press('enter')
  await sleep(60)
}

function decode(index: number) {
  const target = dossier.lines[index]!.value
  const start = performance.now()
  const tick = (now: number) => {
    if (!alive) return
    const progress = Math.min(1, (now - start) / DECODE_MS)
    const settled = Math.floor(progress * target.length)
    shown.value[index] = target.slice(0, settled) + noise(target.slice(settled))
    if (progress < 1) requestAnimationFrame(tick)
    else decoded.value[index] = true
  }
  requestAnimationFrame(tick)
}

async function play() {
  await sleep(500)
  lights.value = 1
  caretLine.value = 1
  await typeInto(command, dossier.command, false)
  if (!alive) return

  await sleep(120)
  lights.value = 2
  caretLine.value = 2
  await typeInto(passphrase, '•'.repeat(PASSPHRASE_LENGTH), true)
  if (!alive) return

  caretLine.value = 0
  decrypting.value = true
  await sleep(60)
  barFull.value = true
  await sleep(DECRYPT_MS)
  if (!alive) return

  granted.value = true
  lights.value = 3
  await keyboard.value?.sweep()
  keyboardGone.value = true
  await sleep(350)
  if (!alive) return

  fileShown.value = true
  dossier.lines.forEach((_line, i) => setTimeout(() => decode(i), i * LINE_STEP_MS))
}

function showFinished() {
  command.value = dossier.command
  passphrase.value = '*'.repeat(PASSPHRASE_LENGTH)
  decrypting.value = true
  barFull.value = true
  granted.value = true
  lights.value = 3
  keyboardGone.value = true
  fileShown.value = true
  shown.value = dossier.lines.map(line => line.value)
  decoded.value = dossier.lines.map(() => true)
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) showFinished()
  else play()
})

onBeforeUnmount(() => {
  alive = false
})
</script>

<template>
  <aside class="crt" aria-label="Operator dossier">
    <!-- Screen readers get the file straight away; the animated screen below is decorative. -->
    <dl class="sr-only">
      <dt>Callsign</dt>
      <dd>{{ dossier.callsign }}</dd>
      <template v-for="line in dossier.lines" :key="line.key">
        <dt>{{ line.key.replace('_', ' ') }}</dt>
        <dd>{{ line.value }}</dd>
      </template>
    </dl>

    <div class="case" aria-hidden="true">
      <div class="screen">
        <div class="hud">
          <span>Secure terminal</span>
          <b>{{ dossier.fileId }}</b>
        </div>

        <p class="cmd">
          <span class="prompt">$ </span>{{ command }}<span v-if="caretLine === 1" class="caret" />
        </p>
        <p class="cmd" :class="{ 'is-hidden': caretLine < 2 && !passphrase }">
          <span class="prompt">passphrase: </span>{{ passphrase }}<span v-if="caretLine === 2" class="caret" />
        </p>

        <div class="decrypt" :class="{ 'is-hidden': !decrypting }">
          <div class="decrypt-label">
            <span>Decrypting file {{ dossier.fileId }}</span>
            <span>AES-256</span>
          </div>
          <div class="decrypt-track">
            <i :class="{ 'is-full': barFull }" />
          </div>
          <p class="granted" :class="{ 'is-hidden': !granted }">
            Access granted
          </p>
        </div>

        <div class="file" :class="{ 'is-hidden': !fileShown }">
          <div class="ident">
            <p class="ident-label">
              Callsign
            </p>
            <p class="callsign" :class="{ 'is-glitching': fileShown }" :data-text="dossier.callsign">
              {{ dossier.callsign }}
            </p>
          </div>

          <div class="stream">
            <span>Raw stream</span>
            <b>BIN → UTF-8</b>
          </div>

          <dl class="rows">
            <div v-for="(line, i) in dossier.lines" :key="line.key" class="row">
              <dt>&gt; {{ line.key }}:</dt>
              <dd :class="{ 'is-decoding': !decoded[i] }">
                {{ shown[i] }}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <span class="led" />
      <span class="vent" />
    </div>
    <div class="stand" aria-hidden="true" />

    <HeroHoloKeyboard ref="keyboard" :gone="keyboardGone" :lights="lights" />
  </aside>
</template>

<style scoped>
.crt {
  --case-hi: color-mix(in srgb, var(--color-secondary) 16%, var(--color-bg-elevated));
  --case-lo: color-mix(in srgb, var(--color-bg) 80%, var(--color-bg-elevated));
  --glass: color-mix(in srgb, var(--color-primary) 16%, var(--color-bg));
  --glass-edge: color-mix(in srgb, var(--color-bg) 55%, black);
  --glow: color-mix(in srgb, var(--color-primary-light) 70%, transparent);

  position: relative;
  width: min(100%, 31rem);
  margin-inline: auto;
  animation: rise 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) 0.3s both;
}

.is-hidden {
  visibility: hidden;
}

/* Monitor casing */
.case {
  position: relative;
  padding: 26px 26px 34px;
  border: 1px solid color-mix(in srgb, var(--color-secondary) 25%, transparent);
  border-radius: 28px 28px 22px 22px;
  background: linear-gradient(170deg, var(--case-hi), var(--case-lo) 70%);
  box-shadow:
    inset 0 -8px 16px color-mix(in srgb, black 50%, transparent),
    0 30px 60px -30px color-mix(in srgb, var(--color-primary) 40%, transparent);
}

.led {
  position: absolute;
  right: 30px;
  bottom: 12px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary-light);
  box-shadow: 0 0 8px var(--color-primary);
  animation: blink 2s steps(1) infinite;
}

.vent {
  position: absolute;
  left: 26px;
  bottom: 12px;
  width: 60px;
  height: 6px;
  border-radius: 3px;
  background: color-mix(in srgb, var(--color-secondary) 18%, transparent);
}

.stand {
  width: 120px;
  height: 22px;
  margin: 0 auto;
  background: linear-gradient(180deg, var(--case-hi), var(--case-lo));
  clip-path: polygon(20% 0, 80% 0, 100% 100%, 0 100%);
}

/* Curved glass: vignette, scanlines, glow; switches on like an old CRT */
.screen {
  position: relative;
  overflow: hidden;
  padding: 16px;
  border-radius: 26px / 20px;
  background: radial-gradient(120% 100% at 50% 45%, var(--glass), var(--glass-edge) 80%);
  box-shadow:
    inset 0 0 50px color-mix(in srgb, black 85%, transparent),
    inset 0 0 12px color-mix(in srgb, var(--color-primary-light) 35%, transparent),
    0 0 0 6px var(--color-bg);
  color: color-mix(in srgb, var(--color-primary-light) 55%, var(--color-text));
  font: 500 13px/1.6 var(--font-mono);
  text-shadow: 0 0 6px var(--glow);
  animation: crt-on 0.7s ease-out 0.2s both;
}

.screen::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background: repeating-linear-gradient(0deg, color-mix(in srgb, black 35%, transparent) 0 1px, transparent 1px 3px);
}

.screen::after {
  content: '';
  position: absolute;
  top: -40px;
  right: 0;
  left: 0;
  z-index: 2;
  height: 40px;
  pointer-events: none;
  background: linear-gradient(transparent, color-mix(in srgb, var(--color-primary-light) 12%, transparent));
  animation: roll 4s linear infinite;
}

.hud,
.stream,
.decrypt-label {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 10.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-secondary);
}

.hud {
  margin-bottom: 10px;
}

.hud b,
.stream b {
  font-weight: 600;
  color: var(--color-primary-light);
}

.hud b {
  text-transform: none;
}

/* Typed command and passphrase */
.cmd {
  min-height: 1.6em;
  margin: 0;
  color: var(--color-text);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.prompt {
  color: var(--color-primary-light);
}

.caret {
  display: inline-block;
  width: 0.6em;
  height: 1.05em;
  vertical-align: -0.18em;
  background: var(--color-primary-light);
  animation: blink 1s steps(1) infinite;
}

/* Decrypt bar, then ACCESS GRANTED */
.decrypt {
  margin: 10px 0 12px;
}

.decrypt-label {
  margin-bottom: 6px;
  color: var(--color-primary-light);
}

.decrypt-track {
  height: 8px;
  padding: 1px;
  border: 1px solid color-mix(in srgb, var(--color-primary-light) 40%, transparent);
}

.decrypt-track i {
  display: block;
  width: 0;
  height: 100%;
  background: repeating-linear-gradient(90deg, var(--color-primary-light) 0 6px, transparent 6px 8px);
  transition: width 0.7s steps(12);
}

.decrypt-track i.is-full {
  width: 100%;
}

.granted {
  margin: 8px 0 0;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text);
}

/* Callsign */
.ident {
  margin-bottom: 10px;
}

.ident-label {
  margin: 0 0 2px;
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-secondary);
}

.callsign {
  position: relative;
  margin: 0;
  font: 700 38px/1 var(--font-hud);
  letter-spacing: 0.08em;
  color: var(--color-text);
}

/* The callsign glitches twice as the file unlocks */
.callsign::before,
.callsign::after {
  content: attr(data-text);
  position: absolute;
  inset: 0;
  opacity: 0;
}

.callsign.is-glitching::before {
  color: var(--color-primary-light);
  transform: translateX(3px);
  animation: glitch 2.8s steps(1) 2;
}

.callsign.is-glitching::after {
  color: var(--color-secondary);
  transform: translateX(-3px);
  animation: glitch 2.8s steps(1) 0.1s 2;
}

.stream {
  margin: 0 0 8px;
}

/* File lines: 0s and 1s decoding into text; one shared grid so labels line up */
.rows {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 2px 10px;
  margin: 0;
}

.row {
  display: contents;
}

.row dt {
  color: var(--color-secondary);
}

.row dd {
  margin: 0;
  min-width: 0;
  color: var(--color-text);
  overflow-wrap: anywhere;
}

.row dd.is-decoding {
  color: color-mix(in srgb, var(--color-primary-light) 70%, transparent);
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
}

@keyframes crt-on {
  0% {
    transform: scale(1, 0.004);
    filter: brightness(4);
  }

  45% {
    transform: scale(1, 0.004);
  }

  70% {
    transform: scale(1, 1.03);
    filter: brightness(1.6);
  }

  100% {
    transform: none;
    filter: none;
  }
}

@keyframes roll {
  to {
    top: 110%;
  }
}

@keyframes glitch {
  0%,
  6% {
    opacity: 0.8;
    clip-path: inset(10% 0 55% 0);
  }

  7%,
  100% {
    opacity: 0;
  }
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

@media (width < 30rem) {
  .case {
    padding: 16px 14px 28px;
    border-radius: 22px 22px 18px 18px;
  }

  .screen {
    padding: 12px;
    font-size: 12px;
  }

  .rows {
    column-gap: 8px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .crt,
  .screen,
  .screen::after,
  .led,
  .caret,
  .callsign.is-glitching::before,
  .callsign.is-glitching::after {
    animation: none;
  }

  .decrypt-track i {
    transition: none;
  }
}
</style>
