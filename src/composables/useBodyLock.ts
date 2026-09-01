import { onBeforeUnmount, watch, type Ref } from 'vue'

let locks = 0

function apply() {
  document.body.classList.toggle('is-locked', locks > 0)
}

/** Блокирует прокрутку страницы, пока открыто модальное окно или мобильное меню. */
export function useBodyLock(active: Ref<boolean>) {
  let held = false

  function lock() {
    if (held) return
    held = true
    locks += 1
    apply()
  }

  function unlock() {
    if (!held) return
    held = false
    locks = Math.max(0, locks - 1)
    apply()
  }

  watch(active, (value) => (value ? lock() : unlock()), { immediate: true })
  onBeforeUnmount(unlock)
}
