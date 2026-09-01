import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { AdminSession } from '@shared/types'
import { api, setAuthToken } from '@/api'

const STORAGE_KEY = 'sssr-admin-token'

function readToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function writeToken(token: string | null) {
  try {
    if (token) localStorage.setItem(STORAGE_KEY, token)
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* хранилище недоступно — сессия живёт до перезагрузки */
  }
}

/**
 * Сессия администратора.
 * Сейчас за ней стоит заглушка на сервере; когда появится настоящая авторизация,
 * поменяются только вызовы api.auth.* — компоненты останутся прежними.
 */
export const useAuthStore = defineStore('auth', () => {
  const session = ref<AdminSession | null>(null)
  /** true, пока проверяем сохранённый токен на старте приложения. */
  const restoring = ref(false)
  let restored = false

  const isAuthenticated = computed(() => session.value !== null)

  async function restore(): Promise<void> {
    if (restored) return
    restored = true

    const token = readToken()
    if (!token) return

    restoring.value = true
    setAuthToken(token)
    try {
      session.value = await api.auth.me()
    } catch {
      setAuthToken(null)
      writeToken(null)
    } finally {
      restoring.value = false
    }
  }

  async function login(loginValue: string, password: string): Promise<void> {
    const result = await api.auth.login(loginValue, password)
    session.value = result
    setAuthToken(result.token)
    writeToken(result.token)
  }

  async function logout(): Promise<void> {
    try {
      await api.auth.logout()
    } finally {
      session.value = null
      setAuthToken(null)
      writeToken(null)
    }
  }

  return { session, restoring, isAuthenticated, restore, login, logout }
})
