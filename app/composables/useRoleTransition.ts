import { computed, onMounted, onUnmounted, ref, type Ref } from 'vue'

export type RoleEffect = 'compile' | 'glitch' | 'live' | 'focus' | 'cut'

export interface Role {
  label: string
  article: 'a' | 'an'
  effect: RoleEffect
}

type Css = Record<string, string | number>

const HOLD_MS = 2600
const TRANS_MS = 1000
const GLYPHS = '01<>/{}[]=+*#$%&;:_-|'

const GLOW = 'color-mix(in srgb, var(--color-primary) 60%, transparent)'

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

/**
 * Drives a rotating role. Each role owns its transition, applied when it arrives:
 * compile (decode), glitch (RGB split), live (signal wipe), focus (rack focus + shutter),
 * cut (editing playhead). The loop pauses while `target` is off-screen and, with
 * prefers-reduced-motion, roles simply swap without any transition.
 */
export function useRoleTransition(roles: Role[], target: Ref<HTMLElement | null>) {
  const started = ref(false)
  const reduced = ref(false)
  const now = ref(0)
  const idx = ref(0)
  const prev = ref(Math.max(0, roles.length - 1))
  const since = ref(0)

  let raf = 0
  let pausedAt = 0
  let observer: IntersectionObserver | undefined
  let motionQuery: MediaQueryList | undefined

  function frame(t: number) {
    now.value = t
    if (t - since.value >= HOLD_MS + TRANS_MS) {
      prev.value = idx.value
      idx.value = (idx.value + 1) % roles.length
      since.value = t
    }
    raf = requestAnimationFrame(frame)
  }

  function run() {
    raf = requestAnimationFrame(frame)
  }

  function stop() {
    cancelAnimationFrame(raf)
    raf = 0
  }

  function onMotionChange(e: MediaQueryListEvent) {
    reduced.value = e.matches
  }

  onMounted(() => {
    motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    reduced.value = motionQuery.matches
    motionQuery.addEventListener('change', onMotionChange)

    // Start settled on the first role so the page loads calm; the first change comes after a hold.
    const t = performance.now()
    now.value = t
    since.value = t - TRANS_MS
    started.value = true

    if (roles.length < 2) return
    run()

    if (target.value) {
      observer = new IntersectionObserver(([entry]) => {
        if (!entry) return
        if (entry.isIntersecting && !raf) {
          since.value += performance.now() - pausedAt
          run()
        } else if (!entry.isIntersecting && raf) {
          pausedAt = performance.now()
          stop()
        }
      })
      observer.observe(target.value)
    }
  })

  onUnmounted(() => {
    stop()
    observer?.disconnect()
    motionQuery?.removeEventListener('change', onMotionChange)
  })

  const view = computed(() => {
    const t = Math.max(0, now.value - since.value)
    const p = !started.value || reduced.value ? 1 : clamp(t / TRANS_MS)
    const role = roles[idx.value]!
    const old = roles[prev.value]!
    const animating = p < 1
    const f = Math.floor(t / 45)
    const e = ease(p)

    let outText: Css = animating ? {} : { opacity: 0 }
    let inText: Css = {}
    let outWrap: Css = {}
    let inWrap: Css = {}
    let inPrefix = role.label
    let inTail = ''
    let cursor = 0
    let edge: { x: number; glow: boolean } | null = null
    let head: number | null = null
    let flash = 0

    if (animating) {
      if (role.effect === 'compile') {
        // Characters resolve left to right out of code-ish noise, terminal cursor riding the edge.
        outText = { opacity: p < 0.15 ? 1 - p / 0.15 : 0 }
        inText = { opacity: p < 0.1 ? 0 : 1 }
        const q = clamp((p - 0.12) / 0.78)
        const k = Math.floor(q * (role.label.length + 1))
        inPrefix = role.label.slice(0, k)
        let tail = ''
        for (let i = k; i < role.label.length; i++) {
          tail += role.label[i] === ' ' ? ' ' : GLYPHS[Math.floor(hash(f * 31 + i) * GLYPHS.length)]
        }
        inTail = tail
        cursor = 1
      } else if (role.effect === 'glitch') {
        // RGB-split shake on the way out, then the new word snaps in through slices and settles.
        const amp = p < 0.4 ? 0.35 + p / 0.4 : (1 - p) / 0.6
        const dx = (hash(f * 7) - 0.5) * 0.28 * amp
        const off = 0.05 + amp * 0.05
        const shadow = `${off.toFixed(3)}em 0 var(--color-primary-light), ${(-off).toFixed(3)}em 0 var(--color-secondary)`
        const shake = `translateX(${dx.toFixed(3)}em) skewX(${((hash(f * 17) - 0.5) * 14 * amp).toFixed(2)}deg)`
        const slice =
          hash(f * 13) > 0.55
            ? `inset(${Math.floor(hash(f * 3) * 55)}% 0 ${Math.floor(hash(f * 5) * 35)}% 0)`
            : 'none'
        if (p < 0.4) {
          outText = { transform: shake, 'text-shadow': shadow, opacity: p > 0.32 ? 1 - (p - 0.32) / 0.08 : 1 }
          outWrap = { 'clip-path': slice }
          inText = { opacity: 0 }
        } else {
          outText = { opacity: 0 }
          inText = {
            transform: shake,
            'text-shadow': shadow,
            opacity: p < 0.85 && hash(f * 11) < 0.18 ? 0.15 : 1,
          }
          inWrap = { 'clip-path': p < 0.8 ? slice : 'none' }
        }
      } else if (role.effect === 'live') {
        // Outgoing word squeezes to a scanline, then a bright signal edge wipes the new one on air.
        const a = clamp(p / 0.3)
        const w = ease(clamp((p - 0.25) / 0.75)) * 100
        outText = { transform: `scaleY(${(1 - a).toFixed(3)})`, opacity: 1 - a }
        inText = { opacity: p < 0.25 ? 0 : 1 }
        inWrap = { 'clip-path': `inset(0 ${(100 - w).toFixed(2)}% 0 0)` }
        if (w > 0.5 && w < 99.5) edge = { x: w, glow: true }
      } else if (role.effect === 'focus') {
        // Rack focus: out-of-focus fade, shutter flash, then the new word sharpens into place.
        const a = clamp(p / 0.5)
        const q = clamp((p - 0.45) / 0.55)
        outText = {
          filter: `blur(${(a * 10).toFixed(1)}px)`,
          opacity: 1 - a,
          transform: `scale(${(1 + 0.05 * a).toFixed(3)})`,
        }
        inText = {
          filter: `blur(${((1 - ease(q)) * 14).toFixed(1)}px)`,
          opacity: clamp(q * 4),
          transform: `scale(${(1 + 0.06 * (1 - ease(q))).toFixed(3)})`,
        }
        flash = Math.max(0, 1 - Math.abs(p - 0.5) / 0.07)
      } else if (role.effect === 'cut') {
        // Editing playhead scrubs across; the new clip sits left of the cut, the old right of it.
        const x = e * 100
        outWrap = { 'clip-path': `inset(0 0 0 ${x.toFixed(2)}%)` }
        inWrap = { 'clip-path': `inset(0 ${(100 - x).toFixed(2)}% 0 0)` }
        if (x > 0.5 && x < 99.5) {
          edge = { x, glow: false }
          head = x
        }
      }
    } else if (role.effect === 'compile') {
      cursor = Math.floor(now.value / 480) % 2 === 0 ? 1 : 0.15
    }

    const edgeStyle: Css | null = edge
      ? {
          left: `${edge.x.toFixed(2)}%`,
          'box-shadow': edge.glow ? `0 0 0.55em 0.08em ${GLOW}` : 'none',
        }
      : null
    const headStyle: Css | null = head !== null ? { left: `calc(${head.toFixed(2)}% - 0.14em)` } : null

    return {
      role,
      oldRole: old,
      animating,
      showN: (p < 0.5 ? old.article : role.article) === 'an',
      outWrap,
      outText,
      inWrap,
      inText,
      inPrefix,
      inTail,
      cursor,
      edge: edgeStyle,
      head: headStyle,
      flash,
    }
  })

  return { view }
}
