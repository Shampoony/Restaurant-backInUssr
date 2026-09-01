import type { vParallax } from '@/directives/parallax'
import type { vReveal } from '@/directives/reveal'
import type { vTilt } from '@/directives/tilt'

/** Глобальные анимационные директивы видны в шаблонах и проверяются типами. */
declare module 'vue' {
  interface GlobalDirectives {
    vReveal: typeof vReveal
    vTilt: typeof vTilt
    vParallax: typeof vParallax
  }
}

export {}
