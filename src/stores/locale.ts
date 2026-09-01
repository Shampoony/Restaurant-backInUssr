import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { Locale, Localized } from '@shared/types'
import { en } from '@/locales/en'
import { ru, type MessageKey } from '@/locales/ru'

const STORAGE_KEY = 'sssr-lang'
const dictionaries = { ru, en } as const

function readStoredLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'ru' || saved === 'en') return saved
  } catch {
    /* приватный режим браузера — просто берём русский */
  }
  return 'ru'
}

/** Язык интерфейса и перевод строк. Выбор запоминается между визитами. */
export const useLocaleStore = defineStore('locale', () => {
  const locale = ref<Locale>(readStoredLocale())
  const dictionary = computed(() => dictionaries[locale.value])

  /** Перевод по ключу с подстановкой параметров: t('menuPage.sub', { dishes: 69 }). */
  function t(key: MessageKey, params?: Record<string, string | number>): string {
    const template: string = dictionary.value[key] ?? key
    if (!params) return template
    return template.replace(/\{(\w+)\}/g, (_match, name: string) =>
      String(params[name] ?? '{' + name + '}'),
    )
  }

  /** Достаёт нужный язык из localized-поля, пришедшего с сервера. */
  function pick(value: Localized | undefined): string {
    return value?.[locale.value] ?? ''
  }

  function setLocale(next: Locale) {
    locale.value = next
  }

  watch(
    locale,
    (value) => {
      document.documentElement.lang = value
      try {
        localStorage.setItem(STORAGE_KEY, value)
      } catch {
        /* хранилище недоступно — язык живёт до перезагрузки страницы */
      }
    },
    { immediate: true },
  )

  return { locale, t, pick, setLocale }
})
