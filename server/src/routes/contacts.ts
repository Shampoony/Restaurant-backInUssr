import { Router } from 'express'
import { requireAdmin } from '../auth.js'
import { db } from '../db.js'
import { Validator } from '../validation.js'

export const contactsRouter = Router()

contactsRouter.get('/', (_req, res) => {
  res.json(db.data.contacts)
})

/* ------------------------------------------------------- админские ручки */

export const adminContactsRouter = Router()
adminContactsRouter.use(requireAdmin)

adminContactsRouter.put('/', async (req, res) => {
  const v = new Validator()
  const contacts = {
    address: {
      ru: v.string('address.ru', req.body?.address?.ru, { max: 160, label: 'Адрес (RU)' }),
      en: v.string('address.en', req.body?.address?.en, { max: 160, label: 'Адрес (EN)' }),
    },
    phone: v.string('phone', req.body?.phone, { max: 40, label: 'Телефон' }),
    openingHours: {
      ru: v.string('openingHours.ru', req.body?.openingHours?.ru, { max: 120, label: 'Часы работы (RU)' }),
      en: v.string('openingHours.en', req.body?.openingHours?.en, { max: 120, label: 'Часы работы (EN)' }),
    },
    email: v.string('email', req.body?.email, { max: 120, label: 'E-mail' }),
    social: {
      instagram: String(req.body?.social?.instagram ?? '#'),
      facebook: String(req.body?.social?.facebook ?? '#'),
      telegram: String(req.body?.social?.telegram ?? '#'),
    },
  }
  v.done()

  db.data.contacts = contacts
  await db.commit()
  res.json(contacts)
})
