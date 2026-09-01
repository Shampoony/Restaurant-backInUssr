import type { ApiErrorBody } from '@shared/types'

/**
 * Единая точка общения с бэкендом.
 * Компоненты никогда не вызывают fetch напрямую — только модули из src/api,
 * поэтому смена транспорта (REST → GraphQL, другой хост) правится в одном файле.
 */
const BASE_URL: string = import.meta.env.VITE_API_URL ?? '/api'

/** Ошибка запроса с кодом и разбором ошибок по полям формы. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fields: Record<string, string> = {},
  ) {
    super(message)
    this.name = 'ApiError'
  }

  /** true, если сервер недоступен — показываем «повторить» вместо текста ошибки. */
  get isNetwork(): boolean {
    return this.status === 0
  }
}

let authToken: string | null = null

/** Токен админской сессии подставляется во все последующие запросы. */
export function setAuthToken(token: string | null): void {
  authToken = token
}

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  const headers = new Headers()
  if (body !== undefined) headers.set('content-type', 'application/json')
  if (authToken) headers.set('authorization', `Bearer ${authToken}`)

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'network_error', 'Сервер недоступен. Проверьте подключение.', {})
  }

  if (response.status === 204) return undefined as T

  const payload: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const error = (payload as ApiErrorBody | null)?.error
    throw new ApiError(
      response.status,
      error?.code ?? 'unknown_error',
      error?.message ?? 'Не удалось выполнить запрос',
      error?.fields ?? {},
    )
  }

  return payload as T
}

export const http = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body ?? {}),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body ?? {}),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body ?? {}),
  delete: <T>(path: string) => request<T>('DELETE', path),
}
