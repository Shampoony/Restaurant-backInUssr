/** Конфигурация сервера. Значения по умолчанию годятся для локальной разработки. */

const adminLogin = process.env.ADMIN_LOGIN ?? 'admin'
const adminPassword = process.env.ADMIN_PASSWORD ?? 'sssr1959'

/**
 * Netlify выставляет NETLIFY=true и в сборке, и в рантайме функций.
 * По этому признаку выбираем хранилище: локально — файл, на Netlify — Blobs.
 */
const onNetlify = process.env.NETLIFY === 'true'

export const env = {
  port: Number(process.env.API_PORT ?? 3001),
  adminLogin,
  adminPassword,
  /** 'file' — JSON-файл рядом с кодом, 'blobs' — постоянное хранилище Netlify. */
  storageDriver: (process.env.STORAGE_DRIVER ?? (onNetlify ? 'blobs' : 'file')) as 'file' | 'blobs',
  /**
   * Ключ подписи админских токенов. На Netlify задайте ADMIN_SECRET в переменных
   * окружения: без него подпись выводится из логина и пароля — это работает,
   * но токены станут недействительными при смене пароля.
   */
  sessionSecret: process.env.ADMIN_SECRET ?? `${adminLogin}:${adminPassword}`,
  /** Время жизни сессии администратора, мс. */
  sessionTtlMs: 1000 * 60 * 60 * 8,
} as const
