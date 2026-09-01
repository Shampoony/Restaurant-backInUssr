import type { NextFunction, Request, Response } from 'express'
import type { ApiErrorBody } from '../../shared/types.js'

/** Ошибка, которую можно безопасно показать клиенту. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message)
  }

  static badRequest(message: string, fields?: Record<string, string>) {
    return new HttpError(400, 'bad_request', message, fields)
  }

  static unauthorized(message = 'Требуется авторизация') {
    return new HttpError(401, 'unauthorized', message)
  }

  static notFound(message = 'Не найдено') {
    return new HttpError(404, 'not_found', message)
  }
}

/** Единый обработчик ошибок: наружу всегда уходит { error: { code, message } }. */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response<ApiErrorBody>,
  _next: NextFunction,
) {
  if (err instanceof HttpError) {
    res.status(err.status).json({
      error: { code: err.code, message: err.message, fields: err.fields },
    })
    return
  }

  console.error('[api] Необработанная ошибка:', err)
  res.status(500).json({
    error: { code: 'internal_error', message: 'Внутренняя ошибка сервера' },
  })
}
