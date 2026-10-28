<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import profile from '~~/content/profile.json'
import contact from '~~/content/contact.json'

const signal = useCommsSignal()

// How loud the signal bars run: a low hum, rising while the visitor types, flat out while sending.
const AMPLITUDE = { standby: 0.42, receiving: 0.9, transmitting: 1 } as const
const amplitude = computed(() => AMPLITUDE[signal.value])
const live = computed(() => signal.value !== 'standby')

// Fixed pseudo-random timings (not Math.random) so the server and the browser draw the same bars.
const BARS = 44
const bars = Array.from({ length: BARS }, (_, i) => ({
  duration: `${(0.8 + ((i * 37) % 11) / 10).toFixed(2)}s`,
  delay: `${(-((i * 53) % 20) / 10).toFixed(2)}s`
}))

const reduced = ref(false)
onMounted(() => (reduced.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches))

const rows = [
  { key: 'WhatsApp', value: profile.phone, href: `https://wa.me/${profile.whatsapp}`, big: true, copy: `+${profile.whatsapp}`, copyLabel: 'Copy WhatsApp number' },
  { key: 'Email', value: profile.email, href: `mailto:${profile.email}`, big: true, copy: profile.email, copyLabel: 'Copy email address' },
  { key: 'Base', value: profile.location },
  { key: 'Reply', value: contact.reply },
  { key: 'Comms', value: contact.languages }
]
</script>

<template>
  <div class="flex flex-col border border-(--color-border) bg-(--color-bg-elevated)">
    <div class="flex items-center justify-between gap-3 border-b border-(--color-border) px-[18px] py-[13px]">
      <span class="label">{{ contact.channel.label }}</span>
      <span class="label open">{{ contact.channel.status }}</span>
    </div>

    <!-- Signal -->
    <div class="wave" :class="{ live }" :style="{ '--amp': amplitude }" aria-hidden="true">
      <span class="label lab">{{ contact.signal[signal] }}</span>
      <i v-for="(bar, index) in bars" :key="index" :class="{ still: reduced }" :style="{ '--d': bar.duration, '--l': bar.delay }" />
    </div>

    <div class="grid flex-1 auto-rows-fr">
      <div
        v-for="row in rows"
        :key="row.key"
        class="grid grid-cols-[104px_minmax(0,1fr)_auto] items-center gap-3 border-b border-(--color-border) px-[18px] py-3.5 last:border-b-0"
      >
        <span class="label">{{ row.key }}</span>

        <a
          v-if="row.href"
          :href="row.href"
          :target="row.href.startsWith('mailto:') ? undefined : '_blank'"
          :rel="row.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'"
          class="min-w-0 font-heading text-[1.05rem] leading-tight font-semibold tracking-[-0.01em] break-words text-(--color-primary-light) transition-colors hover:text-(--color-text) sm:text-[1.15rem]"
        >
          {{ row.value }}
        </a>
        <span v-else class="min-w-0 font-medium break-words text-(--color-text)">{{ row.value }}</span>

        <ContactCopyKey v-if="row.copy" :text="row.copy" :label="row.copyLabel!" />
        <span v-else />
      </div>
    </div>

    <ul class="flex gap-2.5 px-[18px] py-4">
      <li v-for="social in profile.socials" :key="social.platform">
        <ContactSocialTile :social="social" />
      </li>
    </ul>
  </div>
</template>

<style scoped>
.label {
  font: 500 10px/1 var(--font-mono);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-secondary);
}

.open {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--color-live);
}

.open::before {
  content: '';
  width: 7px;
  height: 7px;
  background: currentcolor;
  border-radius: 50%;
  animation: blink 1.6s infinite;
}

@keyframes blink {
  50% { opacity: 0.3; }
}

/* Signal: bars idle at a low hum, rise while you type, run hot (and green) while transmitting */
.wave {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 3px;
  height: 84px;
  padding: 0 18px;
  border-bottom: 1px solid var(--color-border);
  background-image: linear-gradient(to right, color-mix(in srgb, var(--color-primary) 10%, transparent) 1px, transparent 1px);
  background-size: 24px 100%;
}

.lab { position: absolute; top: 9px; left: 18px; }

.wave i {
  flex: 1;
  max-width: 6px;
  height: 100%;
  background: var(--color-primary);
  border-radius: 1px;
  opacity: 0.85;
  transform: scaleY(0.1);
  transform-origin: center;
  transition: background 0.3s;
  animation: wv var(--d, 1.2s) ease-in-out infinite;
  animation-delay: var(--l, 0s);
}

.wave i.still { animation: none; transform: scaleY(0.4); }
.wave.live i { background: var(--color-live); }

@keyframes wv {
  0%, 100% { transform: scaleY(calc(0.08 * var(--amp) + 0.04)); }
  50% { transform: scaleY(calc(0.95 * var(--amp))); }
}

@media (prefers-reduced-motion: reduce) {
  .open::before { animation: none; }
  .wave i { animation: none; transform: scaleY(0.4); }
}
</style>
