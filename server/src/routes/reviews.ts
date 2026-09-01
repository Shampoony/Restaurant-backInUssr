import { randomUUID } from 'node:crypto'
import { Router } from 'express'
import type { Review, ReviewStatus } from '../../../shared/types.js'
import { requireAdmin } from '../auth.js'
import { db } from '../db.js'
import { HttpError } from '../http.js'
import { Validator } from '../validation.js'

export const reviewsRouter = Router()

const REVIEW_STATUSES = ['pending', 'approved', 'rejected'] as const
const newestFirst = (a: Review, b: Review) => Date.parse(b.createdAt) - Date.parse(a.createdAt)

/** Публичный список: только одобренные модератором отзывы. */
reviewsRouter.get('/', (_req, res) => {
  res.json(db.data.reviews.filter((review) => review.status === 'approved').sort(newestFirst))
})

/** Отзыв от гостя: попадает в очередь на модерацию. */
reviewsRouter.post('/', async (req, res) => {
  const v = new Validator()
  const authorName = v.string('authorName', req.body?.authorName, { min: 2, max: 60, label: 'Имя' })
  const rating = v.int('rating', req.body?.rating, { min: 1, max: 5, label: 'Оценка' })
  const text = v.string('text', req.body?.text, { min: 10, max: 800, label: 'Отзыв' })
  v.done()

  const review: Review = {
    id: randomUUID(),
    authorName,
    rating,
    text,
    createdAt: new Date().toISOString(),
    status: 'pending',
  }

  db.data.reviews.push(review)
  await db.commit()
  res.status(201).json(review)
})

/* ------------------------------------------------------- админские ручки */

export const adminReviewsRouter = Router()
adminReviewsRouter.use(requireAdmin)

/** Все отзывы; ?status=pending — фильтр по статусу. */
adminReviewsRouter.get('/', (req, res) => {
  const status = req.query.status as ReviewStatus | undefined
  const list = status
    ? db.data.reviews.filter((review) => review.status === status)
    : [...db.data.reviews]
  res.json(list.sort(newestFirst))
})

adminReviewsRouter.patch('/:id', async (req, res) => {
  const review = db.data.reviews.find((r) => r.id === req.params.id)
  if (!review) throw HttpError.notFound('Отзыв не найден')

  const v = new Validator()
  review.status = v.oneOf('status', req.body?.status, REVIEW_STATUSES)
  v.done()

  await db.commit()
  res.json(review)
})

adminReviewsRouter.delete('/:id', async (req, res) => {
  const index = db.data.reviews.findIndex((r) => r.id === req.params.id)
  if (index === -1) throw HttpError.notFound('Отзыв не найден')

  db.data.reviews.splice(index, 1)
  await db.commit()
  res.status(204).end()
})
