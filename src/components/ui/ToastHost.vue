<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useUiStore } from '@/stores/ui'
import AppIcon from './AppIcon.vue'

/** Всплывающие уведомления: «отзыв отправлен», «бронь принята», ошибки. */
const ui = useUiStore()
const { toasts } = storeToRefs(ui)
</script>

<template>
  <Teleport to="body">
    <div class="toasts" role="status" aria-live="polite">
      <TransitionGroup name="toast">
        <div v-for="toast in toasts" :key="toast.id" class="toast" :class="`toast--${toast.kind}`">
          <AppIcon :name="toast.kind === 'error' ? 'close' : 'check'" :size="16" :stroke-width="2.2" />
          <span>{{ toast.text }}</span>
          <button class="toast__close" type="button" aria-label="×" @click="ui.dismiss(toast.id)">
            <AppIcon name="close" :size="13" :stroke-width="2.2" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toasts {
  position: fixed;
  z-index: 120;
  right: 24px;
  bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 380px;
  padding: 15px 18px;
  border-radius: 2px;
  border-left: 4px solid var(--gold);
  background: var(--ink);
  color: var(--cream);
  font-size: 14px;
  line-height: 1.45;
  box-shadow: var(--shadow-hard);
  pointer-events: auto;
}
.toast--success { border-left-color: var(--gold); }
.toast--error { border-left-color: var(--red); }
.toast--info { border-left-color: var(--paper-2); }

.toast__close {
  margin-left: auto;
  border: none;
  background: none;
  color: oklch(97% 0.014 75 / 0.6);
  cursor: pointer;
  transition: color var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-spring);
}
.toast__close:hover { color: var(--cream); transform: rotate(90deg); }

.toast-enter-active { transition: opacity 0.4s var(--ease-out), transform 0.5s var(--ease-spring); }
.toast-leave-active { transition: opacity 0.3s var(--ease-in-out), transform 0.3s var(--ease-in-out); position: absolute; }
.toast-enter-from { opacity: 0; transform: translateX(40px) scale(0.94); }
.toast-leave-to { opacity: 0; transform: translateX(24px) scale(0.96); }
.toast-move { transition: transform 0.35s var(--ease-out); }

@media (max-width: 640px) {
  .toasts { right: 12px; left: 12px; bottom: 12px; }
  .toast { max-width: none; }
}
</style>
