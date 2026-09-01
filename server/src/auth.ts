import { randomUUID } from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'
import type { AdminSession } from '../../shared/types.js'
import { env } from './env.js'
import { HttpError } from './http.js'

/**
 * Заглушка авторизации: сессии живут в памяти процесса.
 * Когда появится настоящий бэкенд — здесь будет проверка пользователя в БД
 * и подписанный JWT; интерфейс модуля (login/logout/requireAdmin) не изменится.
 */
const sessions = new Map<string, AdminSession>()

export function login(loginValue: string, password: string): AdminSession {
  if (loginValue !== env.adminLogin || password !== env.adminPassword) {
    throw new HttpError(401, 'invalid_credentials', 'Неверный логин или пароль')
  }

  const session: AdminSession = {
    token: randomUUID(),
    login: loginValue,
    expiresAt: new Date(Date.now() + env.sessionTtlMs).toISOString(),
  }
  sessions.set(session.token, session)
  return session
}

export function logout(token: string | null): void {
  if (token) sessions.delete(token)
}

export function getSession(token: string | null): AdminSession | null {
  if (!token) return null
  const session = sessions.get(token)
  if (!session) return null
  if (Date.parse(session.expiresAt) < Date.now()) {
    sessions.delete(token)
    return null
  }
  return session
}

export function readToken(req: Request): string | null {
  const header = req.header('authorization')
  if (!header?.startsWith('Bearer ')) return null
  return header.slice('Bearer '.length).trim() || null
}

/** Сессия, привязанная к текущему запросу (заполняется в requireAdmin). */
const requestSessions = new WeakMap<Request, AdminSession>()

/** Пропускает дальше только запросы с живой админской сессией. */
export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const session = getSession(readToken(req))
  if (!session) throw HttpError.unauthorized()
  requestSessions.set(req, session)
  next()
}

export function currentSession(req: Request): AdminSession | null {
  return requestSessions.get(req) ?? null
}
