import type { Directive } from 'vue'

interface TiltOptions {
  /** Максимальный наклон в градусах. */
  max?: number
  /** Насколько элемент «подпрыгивает» под курсором. */
  lift?: number
  /** Сдвиг внутреннего слоя [data-tilt-layer] для эффекта глубины, px. */
  depth?: number
}

interface TiltState {
  onMove: (event: PointerEvent) => void
  onLeave: () => void
}

const states = new WeakMap<HTMLElement, TiltState>()

/**
 * v-tilt — объёмный ховер: карточка слегка поворачивается вслед за курсором,
 * а слой [data-tilt-layer] внутри смещается сильнее, создавая глубину.
 */
export const vTilt: Directive<HTMLElement, TiltOptions | undefined> = {
  mounted(el, binding) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(hover: none)').matches) return

    const { max = 7, lift = 8, depth = 14 } = binding.value ?? {}
    const layer = el.querySelector<HTMLElement>('[data-tilt-layer]')

    el.style.transformStyle = 'preserve-3d'

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const px = (event.clientX - rect.left) / rect.width - 0.5
      const py = (event.clientY - rect.top) / rect.height - 0.5

      el.style.transition = 'transform 120ms linear'
      el.style.transform = `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translate3d(0, ${-lift}px, 0)`
      if (layer) {
        layer.style.transform = `translate3d(${(px * depth).toFixed(2)}px, ${(py * depth).toFixed(2)}px, 0)`
      }
    }

    const onLeave = () => {
      el.style.transition = 'transform 620ms var(--ease-spring)'
      el.style.transform = ''
      if (layer) layer.style.transform = ''
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    states.set(el, { onMove, onLeave })
  },

  unmounted(el) {
    const state = states.get(el)
    if (!state) return
    el.removeEventListener('pointermove', state.onMove)
    el.removeEventListener('pointerleave', state.onLeave)
    states.delete(el)
  },
}
