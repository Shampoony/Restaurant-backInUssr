import { randomUUID } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { mkdir, rename, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { MenuCategory, Reservation, Review, SiteContacts } from '../../shared/types.js'

const dataDir = resolve(dirname(fileURLToPath(import.meta.url)), '../data')
const dbFile = resolve(dataDir, 'db.json')
const menuSeedFile = resolve(dataDir, 'menu.seed.json')

export interface Database {
  menu: MenuCategory[]
  reviews: Review[]
  reservations: Reservation[]
  contacts: SiteContacts
}

/**
 * Стартовые отзывы — те, что были на статичной версии сайта.
 * Их можно удалить из админки, когда появятся живые.
 */
const seedReviews: Review[] = [
  {
    id: randomUUID(),
    authorName: 'Ирина В.',
    rating: 5,
    text: 'Настоящая машина времени по вкусу — борщ точь-в-точь как у бабушки. Обязательно приду ещё раз всей семьёй.',
    createdAt: '2026-08-12T18:30:00.000Z',
    status: 'approved',
  },
  {
    id: randomUUID(),
    authorName: 'Дмитрий К.',
    rating: 5,
    text: 'Атмосфера огонь: плакаты, музыка, официанты в форме. Котлета по-киевски — отдельный респект повару.',
    createdAt: '2026-07-04T19:10:00.000Z',
    status: 'approved',
  },
  {
    id: randomUUID(),
    authorName: 'Анна С.',
    rating: 4,
    text: 'Порции честные, цены приятные, а мамалыга вообще космос. Одно из любимых мест в городе теперь.',
    createdAt: '2026-06-21T13:45:00.000Z',
    status: 'approved',
  },
]

const seedContacts: SiteContacts = {
  address: { ru: '[Адрес ресторана]', en: '[Restaurant address]' },
  phone: '[Телефон для брони]',
  openingHours: { ru: '[Часы работы]', en: '[Opening hours]' },
  email: 'hello@snova-v-sssr.example',
  social: { instagram: '#', facebook: '#', telegram: '#' },
}

function createSeed(): Database {
  const menu = JSON.parse(readFileSync(menuSeedFile, 'utf-8')) as MenuCategory[]
  return { menu, reviews: seedReviews, reservations: [], contacts: seedContacts }
}

function load(): Database {
  if (!existsSync(dbFile)) return createSeed()
  try {
    return JSON.parse(readFileSync(dbFile, 'utf-8')) as Database
  } catch (error) {
    console.error('[db] Файл повреждён, поднимаю базу из сидов:', error)
    return createSeed()
  }
}

/**
 * Файловое хранилище — временная замена настоящей БД.
 * Когда появится PostgreSQL/MongoDB, меняется только этот модуль:
 * роуты работают через `db.data` и `db.commit()`.
 */
class JsonDatabase {
  data: Database = load()
  private queue: Promise<void> = Promise.resolve()

  /** Сохраняет базу на диск. Записи выстраиваются в очередь, файл пишется атомарно. */
  commit(): Promise<void> {
    this.queue = this.queue.then(async () => {
      await mkdir(dataDir, { recursive: true })
      const tmp = `${dbFile}.${randomUUID()}.tmp`
      await writeFile(tmp, JSON.stringify(this.data, null, 2), 'utf-8')
      await rename(tmp, dbFile)
    })
    return this.queue
  }
}

export const db = new JsonDatabase()
