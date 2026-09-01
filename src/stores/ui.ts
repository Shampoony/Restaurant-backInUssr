import { ref } from 'vue'
import { defineStore } from 'pinia'

export type ToastKind = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  kind: ToastKind
  text: string
}

let nextId = 1

/** Общие состояния интерфейса: всплывающие уведомления и модальные окна. */
export const useUiStore = defineStore('ui', () => {
  const toasts = ref<Toast[]>([])
  const bookingOpen = ref(false)
  const reviewFormOpen = ref(false)

  function notify(text: string, kind: ToastKind = 'success', ttl = 4200) {
    const toast: Toast = { id: nextId++, kind, text }
    toasts.value = [...toasts.value, toast]
    window.setTimeout(() => dismiss(toast.id), ttl)
  }

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  function openBooking() {
    bookingOpen.value = true
  }
  function closeBooking() {
    bookingOpen.value = false
  }
  function openReviewForm() {
    reviewFormOpen.value = true
  }
  function closeReviewForm() {
    reviewFormOpen.value = false
  }

  return {
    toasts,
    bookingOpen,
    reviewFormOpen,
    notify,
    dismiss,
    openBooking,
    closeBooking,
    openReviewForm,
    closeReviewForm,
  }
})
