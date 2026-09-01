import { randomUUID } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { mkdir, rename, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { MenuCategory, Reservation, Review, SiteContacts } from '../../shared/types.js'
import { env } from './env.js'
import { menuSeed } from './menu-seed.js'

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
  return {
    menu: structuredClone(menuSeed),
    reviews: seedReviews,
    reservations: [],
    contacts: seedContacts,
  }
}

/**
 * Драйвер хранилища. Сегодня их два — файл и Netlify Blobs;
 * когда появится настоящая БД, достаточно написать третий с теми же двумя методами.
 */
interface StorageDriver {
  read(): Promise<Database | null>
  write(data: Database): Promise<void>
}

/** Локальная разработка: обычный JSON-файл, запись атомарная. */
class FileDriver implements StorageDriver {
  private readonly dir = resolve(dirname(fileURLToPath(import.meta.url)), '../data')
  private readonly file = resolve(this.dir, 'db.json')

  async read(): Promise<Database | null> {
    if (!existsSync(this.file)) return null
    try {
      return JSON.parse(readFileSync(this.file, 'utf-8')) as Database
    } catch (error) {
      console.error('[db] Файл повреждён, поднимаю базу из сидов:', error)
      return null
    }
  }

  async write(data: Database): Promise<void> {
    await mkdir(this.dir, { recursive: true })
    const tmp = `${this.file}.${randomUUID()}.tmp`
    await writeFile(tmp, JSON.stringify(data, null, 2), 'utf-8')
    await rename(tmp, this.file)
  }
}

/**
 * Netlify Blobs: постоянное хранилище, доступное функциям бесплатно.
 * Файловая система в функциях эфемерна, поэтому в проде работаем только так.
 */
class BlobsDriver implements StorageDriver {
  private readonly storeName = 'sssr-data'
  private readonly key = 'db'

  private async store() {
    const { getStore } = await import('@netlify/blobs')
    return getStore({ name: this.storeName, consistency: 'strong' })
  }

  async read(): Promise<Database | null> {
    const store = await this.store()
    return ((await store.get(this.key, { type: 'json' })) as Database | null) ?? null
  }

  async write(data: Database): Promise<void> {
    const store = await this.store()
    await store.setJSON(this.key, data)
  }
}

/**
 * Хранилище данных сайта.
 *
 * В обычном сервере база живёт в памяти процесса, в serverless-функции —
 * перечитывается на каждый запрос (middleware вызывает `load()`), поэтому
 * роуты работают одинаково в обоих режимах: читают `db.data`, а после
 * изменений зовут `db.commit()`.
 */
class Store {
  private driver: StorageDriver = env.storageDriver === 'blobs' ? new BlobsDriver() : new FileDriver()
  private state: Database | null = null
  private queue: Promise<void> = Promise.resolve()

  /** true, если каждый запрос обслуживает свежий инстанс и кэшу доверять нельзя. */
  private readonly stateless = env.storageDriver === 'blobs'

  get data(): Database {
    if (!this.state) throw new Error('База не загружена: вызовите await db.load() до обращения к данным')
    return this.state
  }

  /** Загружает базу (в serverless — на каждый запрос), при первом старте засевает её. */
  async load(): Promise<void> {
    if (this.state && !this.stateless) return

    const stored = await this.driver.read()
    if (stored) {
      this.state = stored
      return
    }

    this.state = createSeed()
    await this.commit()
  }

  /** Сохраняет базу. Записи выстраиваются в очередь, чтобы не перетереть друг друга. */
  commit(): Promise<void> {
    const snapshot = this.state
    if (!snapshot) return Promise.resolve()

    this.queue = this.queue.then(() => this.driver.write(snapshot))
    return this.queue
  }
}

export const db = new Store()
