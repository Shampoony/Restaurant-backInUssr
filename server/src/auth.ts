import { createHmac, timingSafeEqual } from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'
import type { AdminSession } from '../../shared/types.js'
import { env } from './env.js'
import { HttpError } from './http.js'

/**
 * Авторизация администратора без хранилища сессий: токен подписывается HMAC.
 * Так вход работает и на обычном сервере, и в serverless-функции, где каждый
 * запрос может обслуживать новый инстанс и общей памяти нет.
 *
 * Когда появятся настоящие учётные записи, поменяется только проверка пары
 * логин/пароль — интерфейс модуля (login / logout / requireAdmin) останется прежним.
 */

interface TokenPayload {
  login: string
  /** Время истечения, мс с эпохи. */
  exp: number
}

const encode = (value: object) => Buffer.from(JSON.stringify(value), 'utf-8').toString('base64url')

function sign(body: string): string {
  return createHmac('sha256', env.sessionSecret).update(body).digest('base64url')
}

/** Сравнение подписей постоянное по времени — чтобы не подбирали побайтно. */
function signatureMatches(expected: string, actual: string): boolean {
  const a = Buffer.from(expected)
  const b = Buffer.from(actual)
  return a.length === b.length && timingSafeEqual(a, b)
}

export function login(loginValue: string, password: string): AdminSession {
  if (loginValue !== env.adminLogin || password !== env.adminPassword) {
    throw new HttpError(401, 'invalid_credentials', 'Неверный логин или пароль')
  }

  const payload: TokenPayload = { login: loginValue, exp: Date.now() + env.sessionTtlMs }
  const body = encode(payload)

  return {
    token: `${body}.${sign(body)}`,
    login: loginValue,
    expiresAt: new Date(payload.exp).toISOString(),
  }
}

/**
 * Выход из админки. Токен подписанный и без серверного состояния, поэтому
 * «гасится» он на клиенте — здесь просто подтверждаем операцию.
 */
export function logout(_token: string | null): void {}

export function getSession(token: string | null): AdminSession | null {
  if (!token) return null

  const [body, signature] = token.split('.')
  if (!body || !signature || !signatureMatches(sign(body), signature)) return null

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8')) as TokenPayload
    if (payload.exp < Date.now()) return null
    return { token, login: payload.login, expiresAt: new Date(payload.exp).toISOString() }
  } catch {
    return null
  }
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
