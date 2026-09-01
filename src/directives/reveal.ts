import type { Directive, DirectiveBinding } from 'vue'

export type RevealVariant = 'up' | 'left' | 'right' | 'scale' | 'mask'

interface RevealOptions {
  /** Задержка перед появлением, мс — из неё собирается «каскад» карточек. */
  delay?: number
  /** Доля элемента, которая должна попасть во вьюпорт. */
  threshold?: number
  /** Проигрывать анимацию каждый раз при возврате в зону видимости. */
  repeat?: boolean
}

const REVEALED = 'is-revealed'

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const settings = new WeakMap<Element, RevealOptions>()

/**
 * Один общий IntersectionObserver на весь сайт: дешевле, чем наблюдатель
 * на каждый элемент, и легко отключается при prefers-reduced-motion.
 */
const observer =
  typeof IntersectionObserver === 'undefined'
    ? null
    : new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const options = settings.get(entry.target) ?? {}
            if (entry.isIntersecting) {
              entry.target.classList.add(REVEALED)
              if (!options.repeat) observer?.unobserve(entry.target)
            } else if (options.repeat) {
              entry.target.classList.remove(REVEALED)
            }
          }
        },
        { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
      )

function parse(binding: DirectiveBinding<RevealOptions | number | undefined>): RevealOptions {
  if (typeof binding.value === 'number') return { delay: binding.value }
  return binding.value ?? {}
}

/**
 * v-reveal — плавное появление блока при прокрутке.
 *
 *   <div v-reveal />                     — выезд снизу
 *   <div v-reveal:left />                — выезд слева
 *   <div v-reveal:scale="{ delay: 120 }" — с задержкой (каскад)
 */
export const vReveal: Directive<HTMLElement, RevealOptions | number | undefined> = {
  mounted(el, binding) {
    const options = parse(binding)
    const variant = (binding.arg as RevealVariant | undefined) ?? 'up'

    el.dataset.reveal = variant
    if (options.delay) el.style.setProperty('--reveal-delay', `${options.delay}ms`)

    if (!observer || prefersReducedMotion()) {
      el.classList.add(REVEALED)
      return
    }

    settings.set(el, options)
    observer.observe(el)
  },
  unmounted(el) {
    observer?.unobserve(el)
    settings.delete(el)
  },
}
