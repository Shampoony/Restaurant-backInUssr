<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'

/**
 * Кнопка сайта во всех её видах. Ховер — «заливка» цветом слева направо
 * плюс лёгкий подъём; на клик даётся упругая отдача.
 */
const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'gold' | 'outline' | 'outline-light' | 'ghost'
    /** Ссылка на внутренний роут — компонент сам станет <RouterLink>. */
    to?: RouteLocationRaw
    href?: string
    type?: 'button' | 'submit'
    disabled?: boolean
    loading?: boolean
    block?: boolean
    size?: 'md' | 'sm'
  }>(),
  { variant: 'primary', type: 'button', size: 'md' },
)

const tag = computed(() => {
  if (props.to) return RouterLink
  if (props.href) return 'a'
  return 'button'
})

const attrs = computed(() => {
  if (props.to) return { to: props.to }
  if (props.href) return { href: props.href }
  return { type: props.type, disabled: props.disabled || props.loading }
})
</script>

<template>
  <component
    :is="tag"
    v-bind="attrs"
    class="btn sweep"
    :class="[`btn--${variant}`, `btn--${size}`, { 'btn--block': block, 'is-loading': loading }]"
  >
    <span v-if="loading" class="btn__spinner" aria-hidden="true" />
    <span class="btn__label"><slot /></span>
  </component>
</template>

<style scoped>
.btn {
  --sweep-color: var(--red-deep);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 16px 32px;
  border-radius: 2px;
  border: 2px solid transparent;
  cursor: pointer;
  text-align: center;
  transition:
    color var(--dur-base) var(--ease-out),
    border-color var(--dur-base) var(--ease-out),
    background-color var(--dur-base) var(--ease-out),
    transform var(--dur-base) var(--ease-spring),
    box-shadow var(--dur-base) var(--ease-out);
}
.btn:hover { transform: translateY(-3px); box-shadow: var(--shadow-soft); }
.btn:active { transform: translateY(-1px) scale(0.985); }
.btn[disabled] { opacity: 0.55; cursor: not-allowed; transform: none; box-shadow: none; }

.btn--sm { padding: 11px 20px; font-size: 12.5px; }
.btn--block { display: flex; width: 100%; }

.btn__label { position: relative; display: inline-flex; align-items: center; gap: 10px; }

/* --- варианты --- */
.btn--primary {
  background: var(--red-cta);
  color: var(--cream);
  border-color: var(--red-cta);
  --sweep-color: var(--red-deep);
}
.btn--primary:hover { border-color: var(--red-deep); color: var(--cream); }

.btn--gold {
  background: var(--gold);
  color: var(--red-deep);
  border-color: var(--gold);
  --sweep-color: var(--cream);
}
.btn--gold:hover { border-color: var(--cream); color: var(--red-deep); }

.btn--outline {
  background: transparent;
  color: var(--ink);
  border-color: var(--ink);
  --sweep-color: var(--ink);
}
.btn--outline:hover { color: var(--paper); }

.btn--outline-light {
  background: transparent;
  color: var(--paper);
  border-color: var(--paper);
  --sweep-color: var(--paper);
}
.btn--outline-light:hover { color: var(--red-deep); }

.btn--ghost {
  background: transparent;
  color: var(--ink-soft);
  border-color: transparent;
  --sweep-color: transparent;
  padding: 10px 14px;
}
.btn--ghost:hover { color: var(--red); box-shadow: none; }

/* --- индикатор отправки --- */
.btn__spinner {
  width: 15px;
  height: 15px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin-slow 0.7s linear infinite;
}

@media (max-width: 640px) {
  .btn { padding: 14px 22px; font-size: 12.5px; }
}
</style>
