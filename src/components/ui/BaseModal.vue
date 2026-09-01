<script setup lang="ts">
import { nextTick, ref, toRef, watch } from 'vue'
import { useBodyLock } from '@/composables/useBodyLock'
import { useLocaleStore } from '@/stores/locale'
import AppIcon from './AppIcon.vue'

/** Модальное окно: затемнение, выезд карточки, закрытие по Esc и клику по фону. */
const props = defineProps<{
  open: boolean
  title: string
  subtitle?: string
}>()

const emit = defineEmits<{ close: [] }>()

const { t } = useLocaleStore()
const panel = ref<HTMLElement | null>(null)

useBodyLock(toRef(props, 'open'))

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

watch(
  () => props.open,
  async (open) => {
    if (open) {
      window.addEventListener('keydown', onKeydown)
      await nextTick()
      panel.value?.querySelector<HTMLElement>('input, textarea, select, button')?.focus()
    } else {
      window.removeEventListener('keydown', onKeydown)
    }
  },
)
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal" role="dialog" aria-modal="true" @click.self="emit('close')">
        <div ref="panel" class="modal__panel">
          <button class="modal__close" type="button" :aria-label="t('common.close')" @click="emit('close')">
            <AppIcon name="close" :size="18" />
          </button>

          <div class="modal__head">
            <span class="modal__star">★</span>
            <h2 class="modal__title">{{ title }}</h2>
            <p v-if="subtitle" class="modal__sub">{{ subtitle }}</p>
          </div>

          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: oklch(14% 0.02 40 / 0.62);
  backdrop-filter: blur(6px);
  overflow-y: auto;
}

.modal__panel {
  position: relative;
  width: min(560px, 100%);
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  background: var(--paper);
  border: 3px solid var(--ink);
  border-radius: 3px;
  box-shadow: var(--shadow-hard);
  padding: 40px;
}

/* золотой уголок-акцент, как на карточках */
.modal__panel::before {
  content: '';
  position: absolute;
  inset: 8px;
  border: 1px dashed var(--line);
  pointer-events: none;
}

.modal__close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--ink);
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  transition: transform var(--dur-base) var(--ease-spring), background var(--dur-fast) var(--ease-out),
    color var(--dur-fast) var(--ease-out);
}
.modal__close:hover {
  background: var(--red);
  border-color: var(--red);
  color: var(--cream);
  transform: rotate(90deg);
}

.modal__head { text-align: center; margin-bottom: 26px; }
.modal__star { color: var(--gold-deep); font-size: 14px; }
.modal__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 26px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-top: 6px;
}
.modal__sub { margin-top: 10px; font-size: 14px; color: var(--ink-soft); }

/* --- анимация появления --- */
.modal-enter-active { transition: opacity 0.34s var(--ease-out); }
.modal-leave-active { transition: opacity 0.24s var(--ease-in-out); }
.modal-enter-from,
.modal-leave-to { opacity: 0; }

.modal-enter-active .modal__panel { transition: transform 0.46s var(--ease-spring); }
.modal-leave-active .modal__panel { transition: transform 0.24s var(--ease-in-out); }
.modal-enter-from .modal__panel { transform: translateY(38px) scale(0.94); }
.modal-leave-to .modal__panel { transform: translateY(14px) scale(0.98); }

@media (max-width: 640px) {
  .modal { padding: 14px; }
  .modal__panel { padding: 30px 20px; }
  .modal__title { font-size: 21px; }
}
</style>
