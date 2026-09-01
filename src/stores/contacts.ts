import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { SiteContacts } from '@shared/types'
import { api } from '@/api'

/** Контакты ресторана: адрес, телефон, часы работы. Нужны шапке, подвалу и странице «О нас». */
export const useContactsStore = defineStore('contacts', () => {
  const contacts = ref<SiteContacts | null>(null)
  let request: Promise<void> | null = null

  /** Грузит контакты один раз за сессию; повторные вызовы переиспользуют запрос. */
  function load(): Promise<void> {
    request ??= api.contacts
      .get()
      .then((data) => {
        contacts.value = data
      })
      .catch(() => {
        /* контакты не критичны для рендера — молча оставляем плейсхолдеры */
        request = null
      })
    return request
  }

  function set(next: SiteContacts) {
    contacts.value = next
  }

  return { contacts, load, set }
})
