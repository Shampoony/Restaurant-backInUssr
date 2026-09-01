import { randomUUID } from 'node:crypto'
import { Router } from 'express'
import type { Reservation, ReservationStatus } from '../../../shared/types.js'
import { requireAdmin } from '../auth.js'
import { db } from '../db.js'
import { HttpError } from '../http.js'
import { DATE_RE, PHONE_RE, TIME_RE, Validator } from '../validation.js'

export const reservationsRouter = Router()

const RESERVATION_STATUSES = ['new', 'confirmed', 'cancelled'] as const

/** Бронь столика от гостя. Пока просто складывается в базу и ждёт менеджера. */
reservationsRouter.post('/', async (req, res) => {
  const v = new Validator()
  const guestName = v.string('guestName', req.body?.guestName, { min: 2, max: 60, label: 'Имя' })
  const phone = v.pattern('phone', req.body?.phone, PHONE_RE, 'Укажите телефон в формате +373 777 00 000')
  const date = v.pattern('date', req.body?.date, DATE_RE, 'Выберите дату')
  const time = v.pattern('time', req.body?.time, TIME_RE, 'Выберите время')
  const guests = v.int('guests', req.body?.guests, { min: 1, max: 30, label: 'Гостей' })
  const comment = typeof req.body?.comment === 'string' ? req.body.comment.trim().slice(0, 500) : ''
  v.done()

  const reservation: Reservation = {
    id: randomUUID(),
    guestName,
    phone,
    date,
    time,
    guests,
    comment,
    status: 'new',
    createdAt: new Date().toISOString(),
  }

  db.data.reservations.push(reservation)
  await db.commit()
  res.status(201).json(reservation)
})

/* ------------------------------------------------------- админские ручки */

export const adminReservationsRouter = Router()
adminReservationsRouter.use(requireAdmin)

adminReservationsRouter.get('/', (req, res) => {
  const status = req.query.status as ReservationStatus | undefined
  const list = status
    ? db.data.reservations.filter((item) => item.status === status)
    : [...db.data.reservations]
  res.json(list.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)))
})

adminReservationsRouter.patch('/:id', async (req, res) => {
  const reservation = db.data.reservations.find((item) => item.id === req.params.id)
  if (!reservation) throw HttpError.notFound('Бронь не найдена')

  const v = new Validator()
  reservation.status = v.oneOf('status', req.body?.status, RESERVATION_STATUSES)
  v.done()

  await db.commit()
  res.json(reservation)
})
