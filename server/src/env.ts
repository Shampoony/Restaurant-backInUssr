/** Конфигурация сервера. Значения по умолчанию годятся для локальной разработки. */
export const env = {
  port: Number(process.env.API_PORT ?? 3001),
  adminLogin: process.env.ADMIN_LOGIN ?? 'admin',
  adminPassword: process.env.ADMIN_PASSWORD ?? 'sssr1959',
  /** Время жизни сессии администратора, мс. */
  sessionTtlMs: 1000 * 60 * 60 * 8,
} as const
