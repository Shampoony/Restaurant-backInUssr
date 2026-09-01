import { Router } from 'express'
import type { Dish } from '../../../shared/types.js'
import { requireAdmin } from '../auth.js'
import { db } from '../db.js'
import { HttpError } from '../http.js'
import { Validator } from '../validation.js'

export const menuRouter = Router()

const byOrder = (a: { order: number }, b: { order: number }) => a.order - b.order

/** Публичное меню: категории по порядку, скрытые блюда отфильтрованы. */
menuRouter.get('/', (_req, res) => {
  const categories = [...db.data.menu].sort(byOrder).map((category) => ({
    ...category,
    dishes: category.dishes.filter((dish) => !dish.hidden),
  }))
  res.json(categories)
})

/** Подборка для главной страницы. */
menuRouter.get('/featured', (_req, res) => {
  const featured = db.data.menu
    .flatMap((category) => category.dishes)
    .filter((dish) => dish.featured && !dish.hidden)
  res.json(featured)
})

/* ------------------------------------------------------- админские ручки */

export const adminMenuRouter = Router()
adminMenuRouter.use(requireAdmin)

/** Полное меню, включая скрытые позиции. */
adminMenuRouter.get('/', (_req, res) => {
  res.json([...db.data.menu].sort(byOrder))
})

adminMenuRouter.patch('/dishes/:id', async (req, res) => {
  const dish = db.data.menu.flatMap((category) => category.dishes).find((d) => d.id === req.params.id)
  if (!dish) throw HttpError.notFound('Блюдо не найдено')

  const patch: Partial<Dish> = {}
  const v = new Validator()

  if ('price' in req.body) patch.price = v.int('price', req.body.price, { min: 0, max: 100000, label: 'Цена' })
  if ('featured' in req.body) patch.featured = Boolean(req.body.featured)
  if ('hidden' in req.body) patch.hidden = Boolean(req.body.hidden)
  if (req.body?.name) {
    patch.name = {
      ru: v.string('name.ru', req.body.name.ru, { max: 160, label: 'Название (RU)' }),
      en: v.string('name.en', req.body.name.en, { max: 160, label: 'Название (EN)' }),
    }
  }
  v.done()

  Object.assign(dish, patch)
  await db.commit()
  res.json(dish)
})
