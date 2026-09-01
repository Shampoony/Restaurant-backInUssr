import type { Directive } from 'vue'

/** Элементы, участвующие в параллаксе, и их коэффициент смещения. */
const targets = new Map<HTMLElement, number>()
let frame = 0

function update() {
  frame = 0
  const viewport = window.innerHeight

  for (const [el, speed] of targets) {
    const rect = el.getBoundingClientRect()
    if (rect.bottom < -200 || rect.top > viewport + 200) continue
    // 0 в центре экрана, ±1 у краёв
    const progress = (rect.top + rect.height / 2 - viewport / 2) / viewport
    el.style.setProperty('--parallax-y', `${(progress * speed * -100).toFixed(2)}px`)
  }
}

function onScroll() {
  if (frame) return
  frame = requestAnimationFrame(update)
}

/**
 * v-parallax="0.3" — элемент едет медленнее страницы.
 * Смещение отдаётся через CSS-переменную --parallax-y, чтобы не спорить
 * с остальными трансформациями компонента.
 */
export const vParallax: Directive<HTMLElement, number | undefined> = {
  mounted(el, binding) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    if (targets.size === 0) {
      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('resize', onScroll)
    }
    targets.set(el, binding.value ?? 0.25)
    onScroll()
  },

  unmounted(el) {
    targets.delete(el)
    if (targets.size === 0) {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  },
}
