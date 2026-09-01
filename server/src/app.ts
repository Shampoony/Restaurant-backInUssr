import cors from 'cors'
import express, { type Express } from 'express'
import { db } from './db.js'
import { env } from './env.js'
import { errorHandler, HttpError } from './http.js'
import { authRouter } from './routes/auth.js'
import { adminContactsRouter, contactsRouter } from './routes/contacts.js'
import { adminMenuRouter, menuRouter } from './routes/menu.js'
import { adminReservationsRouter, reservationsRouter } from './routes/reservations.js'
import { adminReviewsRouter, reviewsRouter } from './routes/reviews.js'

/**
 * Приложение Express без привязки к способу запуска.
 * Локально его слушает `server/src/index.ts`, на Netlify — функция `netlify/functions/api.ts`.
 */
export function createApp(): Express {
  const app = express()

  app.use(cors())
  app.use(express.json({ limit: '256kb' }))

  /* база должна быть под рукой до любого роута: в serverless её читают на каждый запрос */
  app.use(async (_req, _res, next) => {
    await db.load()
    next()
  })

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', storage: env.storageDriver, time: new Date().toISOString() })
  })

  /* публичное API */
  app.use('/api/menu', menuRouter)
  app.use('/api/reviews', reviewsRouter)
  app.use('/api/reservations', reservationsRouter)
  app.use('/api/contacts', contactsRouter)
  app.use('/api/auth', authRouter)

  /* API админки — каждый роутер сам требует авторизации */
  app.use('/api/admin/menu', adminMenuRouter)
  app.use('/api/admin/reviews', adminReviewsRouter)
  app.use('/api/admin/reservations', adminReservationsRouter)
  app.use('/api/admin/contacts', adminContactsRouter)

  app.use('/api', () => {
    throw HttpError.notFound('Неизвестный метод API')
  })

  app.use(errorHandler)

  return app
}
