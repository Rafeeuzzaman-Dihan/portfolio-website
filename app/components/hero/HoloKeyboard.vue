<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  gone: boolean
  lights: number
}>()

// [legend, id, width in key units, extra class]
type Key = [string, string, number?, string?]
const ROWS: Key[][] = [
  [['Esc', 'esc', 1, 'is-accent'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5'], ['6', '6'], ['7', '7'], ['8', '8'], ['9', '9'], ['0', '0'], ['-', '-'], ['=', '='], ['Back', 'back', 2]],
  [['Tab', 'tab', 1.5], ['Q', 'q'], ['W', 'w'], ['E', 'e'], ['R', 'r'], ['T', 't'], ['Y', 'y'], ['U', 'u'], ['I', 'i'], ['O', 'o'], ['P', 'p'], ['[', '['], [']', ']'], ['\\', '\\', 1.5]],
  [['Caps', 'caps', 1.75], ['A', 'a'], ['S', 's'], ['D', 'd'], ['F', 'f'], ['G', 'g'], ['H', 'h'], ['J', 'j'], ['K', 'k'], ['L', 'l'], [';', ';'], ['\'', '\''], ['Enter', 'enter', 2.25, 'is-accent']],
  [['Shift', 'shift', 2.25], ['Z', 'z'], ['X', 'x'], ['C', 'c'], ['V', 'v'], ['B', 'b'], ['N', 'n'], ['M', 'm'], [',', ','], ['.', '.'], ['/', '/'], ['Shift', 'rshift', 2.75]],
  [['Ctrl', 'ctrl', 1.5], ['Fn', 'fn', 1.25], ['Alt', 'alt', 1.25], ['', 'space', 6.5], ['Alt', 'ralt', 1.25], ['Fn', 'rfn', 1.25], ['Ctrl', 'rctrl', 1.5]]
]

const keysEl = ref<HTMLElement | null>(null)
const keyEl = (id: string) => keysEl.value?.querySelector<HTMLElement>(`[data-key="${CSS.escape(id)}"]`) ?? null

// Which key (and whether Shift) produces a character.
function keyFor(char: string): [string, boolean] {
  if (char === ' ') return ['space', false]
  if (char === '_') return ['-', true]
  if (char === '@') return ['2', true]
  if (/[A-Z]/.test(char)) return [char.toLowerCase(), true]
  return [char.toLowerCase(), false]
}

// Visual key press: the key (plus Shift) lights, sinks and throws a ripple.
function press(id: string, shift = false) {
  const keys = [keyEl(id), shift ? keyEl('shift') : null].filter((key): key is HTMLElement => !!key)
  for (const key of keys) {
    key.classList.add('is-down')
    const ripple = document.createElement('span')
    ripple.className = 'ripple'
    key.appendChild(ripple)
    setTimeout(() => ripple.remove(), 500)
  }
  setTimeout(() => keys.forEach(key => key.classList.remove('is-down')), 90)
}

function pressChar(char: string) {
  const [id, shift] = keyFor(char)
  press(id, shift)
}

// A quick light wave across every key before powering down.
async function sweep() {
  const keys = [...(keysEl.value?.querySelectorAll<HTMLElement>('.key') ?? [])]
  for (let i = 0; i < keys.length; i += 4) {
    keys.slice(i, i + 4).forEach((key) => {
      key.classList.add('is-lit')
      setTimeout(() => key.classList.remove('is-lit'), 160)
    })
    await new Promise(resolve => setTimeout(resolve, 8))
  }
}

defineExpose({ press, pressChar, sweep })
</script>

<template>
  <div class="wrap" :class="{ 'is-gone': gone }" aria-hidden="true">
    <div class="board">
      <div class="top">
        <span>ViRUS_00</span>
        <span class="lights">
          <i v-for="n in 3" :key="n" :class="{ 'is-on': lights >= n }" />
        </span>
      </div>
      <div ref="keysEl">
        <div v-for="(row, r) in ROWS" :key="r" class="row">
          <span
            v-for="[legend, id, width = 1, extra = ''] in row"
            :key="id"
            class="key"
            :class="extra"
            :data-key="id"
            :style="{ '--w': width }"
          >{{ legend }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/*
 * Projected over the lower half of the screen, where the file appears later,
 * so it takes no extra space and nothing shifts when it leaves.
 */
.wrap {
  position: absolute;
  right: 7%;
  bottom: 64px;
  left: 7%;
  z-index: 3;
  pointer-events: none;
}

.wrap.is-gone {
  visibility: hidden;
  transition: visibility 0s 0.55s;
}

/* Projected keyboard: outline keys, no body, tilted flat like it's beamed onto a desk */
.board {
  position: relative;
  min-height: 0;
  overflow: hidden;
  padding: 10px 10px 14px;
  border-top: 1px solid color-mix(in srgb, var(--color-primary-light) 55%, transparent);
  background: linear-gradient(180deg, color-mix(in srgb, var(--color-primary) 10%, transparent), color-mix(in srgb, var(--color-primary) 2%, transparent));
  box-shadow: 0 -8px 30px -12px color-mix(in srgb, var(--color-primary) 60%, transparent);
  transform: perspective(700px) rotateX(38deg);
  transform-origin: 50% 0;
}

.board::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(0deg, color-mix(in srgb, var(--color-primary-light) 8%, transparent) 0 1px, transparent 1px 3px);
}

/* Leaves by dissolving into scanlines */
.is-gone .board {
  animation: dissolve 0.55s steps(7) forwards;
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 2px 10px;
  font: 600 9.5px/1 var(--font-mono);
  letter-spacing: 0.2em;
  color: var(--color-primary-light);
}

.lights {
  display: flex;
  gap: 8px;
}

.lights i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-secondary) 25%, transparent);
  transition: background-color 0.2s, box-shadow 0.2s;
}

.lights i.is-on {
  background: var(--color-primary-light);
  box-shadow: 0 0 6px var(--color-primary);
}

.row {
  display: flex;
  gap: 4px;
  margin-bottom: 4px;
}

.key {
  --unit: calc((100% - 14 * 4px) / 15);

  position: relative;
  display: flex;
  flex: 0 0 calc(var(--unit) * var(--w) + 4px * (var(--w) - 1));
  align-items: center;
  justify-content: center;
  height: 24px;
  border: 1px solid color-mix(in srgb, var(--color-primary-light) 45%, transparent);
  border-radius: 4px;
  background: color-mix(in srgb, var(--color-primary) 6%, transparent);
  color: color-mix(in srgb, var(--color-primary-light) 80%, var(--color-text));
  font: 600 9px/1 var(--font-mono);
  text-shadow: 0 0 6px color-mix(in srgb, var(--color-primary-light) 80%, transparent);
  transition: background-color 0.15s, box-shadow 0.07s, color 0.15s;
}

.key.is-accent {
  border-color: var(--color-primary-light);
}

.key.is-down {
  background: color-mix(in srgb, var(--color-primary-light) 45%, transparent);
  color: var(--color-text);
  box-shadow: 0 0 18px var(--color-primary-light);
}

.key.is-lit {
  background: color-mix(in srgb, var(--color-primary-light) 25%, transparent);
}

.key :deep(.ripple) {
  position: absolute;
  inset: -1px;
  border: 1px solid var(--color-primary-light);
  border-radius: inherit;
  pointer-events: none;
  animation: ripple 0.5s ease-out forwards;
}

@keyframes ripple {
  from {
    opacity: 0.8;
    transform: scale(1);
  }

  to {
    opacity: 0;
    transform: scale(1.5);
  }
}

@keyframes dissolve {
  0% {
    clip-path: inset(0 0 0 0);
    opacity: 1;
  }

  30% {
    clip-path: polygon(0 0, 100% 0, 100% 12%, 0 12%, 0 22%, 100% 22%, 100% 40%, 0 40%, 0 55%, 100% 55%, 100% 70%, 0 70%, 0 88%, 100% 88%, 100% 100%, 0 100%);
    filter: brightness(1.8);
  }

  70% {
    clip-path: polygon(0 0, 100% 0, 100% 4%, 0 4%, 0 30%, 100% 30%, 100% 34%, 0 34%, 0 62%, 100% 62%, 100% 66%, 0 66%, 0 94%, 100% 94%, 100% 98%, 0 98%);
    opacity: 0.6;
  }

  100% {
    clip-path: inset(50% 0 50% 0);
    opacity: 0;
  }
}

@media (width < 30rem) {
  .wrap {
    right: 4%;
    bottom: 52px;
    left: 4%;
  }

  .board {
    padding: 8px 6px 10px;
  }

  .top {
    margin-bottom: 6px;
    font-size: 8px;
  }

  .row {
    gap: 3px;
    margin-bottom: 3px;
  }

  .key {
    --unit: calc((100% - 14 * 3px) / 15);

    flex-basis: calc(var(--unit) * var(--w) + 3px * (var(--w) - 1));
    height: 17px;
    border-radius: 3px;
    font-size: 6px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .wrap.is-gone {
    transition: none;
  }

  .is-gone .board {
    animation: none;
  }
}
</style>
