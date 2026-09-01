import cors from 'cors'
import express from 'express'
import { env } from './env.js'
import { errorHandler, HttpError } from './http.js'
import { authRouter } from './routes/auth.js'
import { adminContactsRouter, contactsRouter } from './routes/contacts.js'
import { adminMenuRouter, menuRouter } from './routes/menu.js'
import { adminReservationsRouter, reservationsRouter } from './routes/reservations.js'
import { adminReviewsRouter, reviewsRouter } from './routes/reviews.js'

const app = express()

app.use(cors())
app.use(express.json({ limit: '256kb' }))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
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

app.listen(env.port, () => {
  console.log(`[api] «Снова в СССР» — REST API на http://localhost:${env.port}/api`)
})
