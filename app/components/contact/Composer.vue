<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import profile from '~~/content/profile.json'
import contact from '~~/content/contact.json'

type Channel = 'whatsapp' | 'email'

const copy = contact.composer
const signal = useCommsSignal()

const channel = ref<Channel>('whatsapp')
const name = ref('')
const message = ref('')
const errors = ref({ name: '', message: '' })
const phase = ref<'idle' | 'sending' | 'done'>('idle')

const text = computed(() => copy[channel.value])

// Nothing is stored or sent from here: the message only goes into a WhatsApp or email link the visitor opens themselves.
// Email opens Gmail in the browser first, because a mailto: link does nothing for a visitor with no email app set up.
const email = computed(() => {
  const who = name.value.trim()
  const subject = copy.email.subject.replace('{name}', who)
  const body = `${copy.email.greeting}\n\n${message.value.trim()}\n\n${copy.email.signoff.replace('{name}', who)}`
  const to = encodeURIComponent(profile.email)
  const su = encodeURIComponent(subject)
  const bd = encodeURIComponent(body)
  return {
    gmail: `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${su}&body=${bd}`,
    outlook: `https://outlook.live.com/mail/0/deeplink/compose?to=${to}&subject=${su}&body=${bd}`,
    app: `mailto:${profile.email}?subject=${su}&body=${bd}`,
    plain: `To: ${profile.email}\nSubject: ${subject}\n\n${body}`
  }
})

const link = computed(() => {
  if (channel.value === 'whatsapp') {
    const note = `${copy.whatsapp.greeting.replace('{name}', name.value.trim())}\n\n${message.value.trim()}`
    return `https://wa.me/${profile.whatsapp}?text=${encodeURIComponent(note)}`
  }
  return email.value.gmail
})

const { copied, copy: copyText } = useClipboard(1600)

let idle: ReturnType<typeof setTimeout> | undefined
let finish: ReturnType<typeof setTimeout> | undefined

// The waveform listens while the visitor types, then settles.
function typing() {
  if (phase.value !== 'idle') return
  signal.value = 'receiving'
  clearTimeout(idle)
  idle = setTimeout(() => {
    if (phase.value === 'idle') signal.value = 'standby'
  }, 900)
}

function submit() {
  errors.value = {
    name: name.value.trim() ? '' : copy.nameError,
    message: message.value.trim() ? '' : copy.messageError
  }
  if (errors.value.name || errors.value.message) return

  // Open the link right away, inside the click, so the browser does not treat it as a blocked pop-up.
  window.open(link.value, '_blank', 'noopener')

  phase.value = 'sending'
  signal.value = 'transmitting'
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  finish = setTimeout(() => {
    phase.value = 'done'
    signal.value = 'standby'
  }, reduced ? 0 : 1500)
}

function edit() {
  phase.value = 'idle'
}

onBeforeUnmount(() => {
  clearTimeout(idle)
  clearTimeout(finish)
  signal.value = 'standby'
})
</script>

<template>
  <form class="relative flex flex-col border border-(--color-border) bg-(--color-bg-elevated)" novalidate @submit.prevent="submit">
    <div class="flex items-center justify-between gap-3 border-b border-(--color-border) px-[18px] py-[13px]">
      <span class="label">{{ copy.label }}</span>
      <span class="label">{{ text.via }}</span>
    </div>

    <div class="flex flex-1 flex-col gap-3.5 px-[18px] py-[18px] sm:px-6 sm:py-[22px]">
      <h3 class="font-heading text-[clamp(1.5rem,2.6vw,2rem)] leading-[1.05] font-bold tracking-[-0.035em] text-balance text-(--color-text)">
        {{ copy.title }}
      </h3>
      <p class="-mt-1.5 max-w-[30rem] text-[0.92rem] text-(--color-text-muted)">
        {{ copy.text }}
      </p>

      <div class="grid gap-3.5 sm:grid-cols-2">
        <div class="grid gap-2" :class="{ bad: errors.name }">
          <label for="contact-name" class="label">{{ copy.nameLabel }}</label>
          <input
            id="contact-name"
            v-model="name"
            class="field"
            autocomplete="name"
            :placeholder="copy.namePlaceholder"
            @input="typing"
          >
          <span v-if="errors.name" class="err">{{ errors.name }}</span>
        </div>

        <div class="grid gap-2">
          <span id="contact-channel" class="label">{{ copy.channelLabel }}</span>
          <div class="seg" role="group" aria-labelledby="contact-channel">
            <button type="button" :aria-pressed="channel === 'whatsapp'" @click="channel = 'whatsapp'">
              <IconsSocialIcon name="whatsapp" class="size-[17px]!" />{{ copy.whatsapp.label }}
            </button>
            <button type="button" :aria-pressed="channel === 'email'" @click="channel = 'email'">
              <IconsSocialIcon name="mail" class="size-[17px]!" />{{ copy.email.label }}
            </button>
          </div>
        </div>
      </div>

      <div class="flex min-h-0 flex-1 flex-col gap-2" :class="{ bad: errors.message }">
        <label for="contact-message" class="label flex justify-between">
          <span>{{ copy.messageLabel }}</span>
          <span class="tabular-nums">{{ message.length }} / {{ copy.maxLength }}</span>
        </label>
        <textarea
          id="contact-message"
          v-model="message"
          class="field min-h-[84px] flex-1 resize-none"
          :maxlength="copy.maxLength"
          :placeholder="copy.messagePlaceholder"
          @input="typing"
        />
        <span v-if="errors.message" class="err">{{ errors.message }}</span>
      </div>

      <div class="flex flex-wrap items-center gap-x-5 gap-y-3.5">
        <button type="submit" class="send">
          <span class="kc" aria-hidden="true">↵</span>{{ copy.send }}
        </button>
        <p class="font-mono text-[11px] leading-normal text-(--color-text-muted)">
          {{ text.hint }}
        </p>
      </div>
    </div>

    <!-- Transmit overlay: the bar fills while the link opens, then it says what to do next -->
    <div v-if="phase !== 'idle'" class="tx" role="status" aria-live="polite">
      <div v-if="phase === 'sending'" class="grid justify-items-center gap-3.5">
        <span class="label">{{ copy.transmitting }}</span>
        <div class="bar"><b /></div>
      </div>

      <div v-else class="grid justify-items-center gap-3.5">
        <span class="font-mono text-[11px] tracking-[0.14em] text-(--color-live) uppercase">● {{ copy.ready }}</span>
        <h4 class="font-heading text-[1.6rem] leading-[1.1] font-bold tracking-[-0.03em] text-(--color-text)">
          {{ text.doneTitle }}
        </h4>
        <p class="max-w-[24rem] text-[0.92rem] text-(--color-text-muted)">
          {{ text.doneText }}
        </p>
        <a :href="link" target="_blank" rel="noopener noreferrer" class="link">{{ copy.retry }}</a>

        <!-- No Gmail? Other ways to get the same message to me, none of which need an email app set up -->
        <div v-if="channel === 'email'" class="others">
          <span class="label">{{ copy.others.label }}</span>
          <div class="flex flex-wrap justify-center gap-2">
            <a :href="email.outlook" target="_blank" rel="noopener noreferrer" class="alt">{{ copy.others.outlook }}</a>
            <a :href="email.app" class="alt">{{ copy.others.app }}</a>
            <button type="button" class="alt" @click="copyText(email.plain)">
              {{ copied ? copy.others.copied : copy.others.copy }}
            </button>
          </div>
        </div>

        <button type="button" class="link" @click="edit">
          {{ copy.edit }}
        </button>
      </div>
    </div>
  </form>
</template>

<style scoped>
.label {
  font: 500 11px/1 var(--font-mono);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-secondary);
}

.field {
  width: 100%;
  padding: 10px 14px;
  color: var(--color-text);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 0;
  outline: none;
  transition: border-color 0.25s, box-shadow 0.25s;
}

.field::placeholder { color: color-mix(in srgb, var(--color-text-muted) 70%, transparent); }
.field:focus { border-color: var(--color-primary); box-shadow: 0 0 22px -10px var(--color-primary); }
.bad .field { border-color: var(--color-alert); }
.err { font: 500 11px var(--font-mono); color: var(--color-alert); }

/* Send with: WhatsApp first, then email */
.seg {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
}

.seg button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 9px 12px;
  font: 600 0.92rem var(--font-heading);
  color: var(--color-text-muted);
  cursor: pointer;
  background: none;
  border: 0;
  transition: color 0.25s, background 0.25s;
}

.seg button + button { border-left: 1px solid var(--color-border); }

.seg button[aria-pressed='true'] {
  color: var(--color-text);
  background: color-mix(in srgb, var(--color-primary) 18%, var(--color-bg));
  box-shadow: inset 0 -2px 0 var(--color-primary);
}

.seg button:focus-visible,
.send:focus-visible,
.link:focus-visible { outline: 2px solid var(--color-primary-light); outline-offset: 3px; }

/* The send button floods with blue from the left, like the Case study button, and its keycap presses down */
.send {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 11px 22px 11px 12px;
  overflow: hidden;
  font: 600 0.98rem var(--font-heading);
  color: var(--color-text);
  cursor: pointer;
  background: transparent;
  border: 1px solid var(--color-primary);
  isolation: isolate;
  transition: translate 0.25s;
}

.send::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: var(--color-primary);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.35s ease;
}

.send:hover { translate: 0 -2px; }
.send:hover::before,
.send:focus-visible::before { transform: scaleX(1); }
.send:hover,
.send:focus-visible { color: var(--on-accent); }

.kc {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  font: 600 14px var(--font-mono);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-secondary);
  border-radius: 6px;
  box-shadow: 0 3px 0 var(--color-secondary);
  transition: translate 0.15s, box-shadow 0.15s;
}

.send:hover .kc { translate: 0 3px; box-shadow: 0 0 0 var(--color-secondary); }

.tx {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: grid;
  place-content: center;
  justify-items: center;
  padding: 24px;
  text-align: center;
  background: var(--color-bg-elevated);
}

.bar { position: relative; width: min(280px, 70vw); height: 4px; overflow: hidden; background: var(--color-border); }

.bar b {
  position: absolute;
  inset: 0 auto 0 0;
  width: 0;
  background: var(--color-primary);
  box-shadow: 0 0 10px var(--color-primary);
  animation: fillbar 1.4s ease-in-out forwards;
}

@keyframes fillbar {
  to { width: 100%; }
}

.others { display: grid; justify-items: center; gap: 10px; padding-top: 14px; margin-top: 2px; border-top: 1px dashed var(--color-border); }

.alt {
  padding: 8px 14px;
  font: 600 0.85rem var(--font-heading);
  color: var(--color-text);
  text-decoration: none;
  cursor: pointer;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  transition: border-color 0.25s, color 0.25s, translate 0.25s;
}

.alt:hover { color: var(--color-primary-light); border-color: var(--color-primary); translate: 0 -2px; }
.alt:focus-visible { outline: 2px solid var(--color-primary-light); outline-offset: 3px; }

.link {
  padding: 0;
  font: 500 12px var(--font-mono);
  letter-spacing: 0.08em;
  color: var(--color-primary-light);
  text-decoration: underline;
  text-underline-offset: 4px;
  cursor: pointer;
  background: none;
  border: 0;
}

@media (prefers-reduced-motion: reduce) {
  .send, .send::before, .kc, .field, .alt { transition: none; }
  .bar b { animation: none; width: 100%; }
}
</style>
