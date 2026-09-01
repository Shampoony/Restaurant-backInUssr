/**
 * Типы, общие для фронтенда и REST API.
 * Один источник правды: сервер отдаёт ровно эти структуры, клиент их же и ожидает.
 */

/** Языки интерфейса. */
export type Locale = 'ru' | 'en'

/** Строка, у которой есть перевод на каждый поддерживаемый язык. */
export type Localized = Record<Locale, string>

/* ------------------------------------------------------------------ меню */

export interface Dish {
  id: string
  /** Идентификатор категории, к которой относится блюдо. */
  categoryId: string
  name: Localized
  /** Цена в рублях ПМР, целое число. */
  price: number
  /** Путь к фотографии; пока фотосъёмки нет — null, рисуем плейсхолдер. */
  photoUrl: string | null
  /** Показывать ли блюдо в подборке на главной. */
  featured: boolean
  /** Скрытые блюда не отдаются публичному API. */
  hidden: boolean
}

export interface MenuCategory {
  id: string
  title: Localized
  /** Порядок вывода в меню. */
  order: number
  dishes: Dish[]
}

/* ---------------------------------------------------------------- отзывы */

export type ReviewStatus = 'pending' | 'approved' | 'rejected'

export interface Review {
  id: string
  authorName: string
  /** Оценка от 1 до 5. */
  rating: number
  text: string
  /** Дата визита или отправки отзыва, ISO-строка. */
  createdAt: string
  status: ReviewStatus
}

/** То, что отправляет гость из формы отзыва. */
export interface ReviewDraft {
  authorName: string
  rating: number
  text: string
}

/* ---------------------------------------------------------------- брони */

export type ReservationStatus = 'new' | 'confirmed' | 'cancelled'

export interface Reservation {
  id: string
  guestName: string
  phone: string
  /** Дата в формате YYYY-MM-DD. */
  date: string
  /** Время в формате HH:MM. */
  time: string
  guests: number
  comment: string
  status: ReservationStatus
  createdAt: string
}

export interface ReservationDraft {
  guestName: string
  phone: string
  date: string
  time: string
  guests: number
  comment?: string
}

/* ------------------------------------------------- контакты и реквизиты */

export interface SiteContacts {
  address: Localized
  phone: string
  openingHours: Localized
  email: string
  social: {
    instagram: string
    facebook: string
    telegram: string
  }
}

/* ---------------------------------------------------------- авторизация */

export interface AdminSession {
  token: string
  login: string
  /** Время истечения токена, ISO-строка. */
  expiresAt: string
}

/* ------------------------------------------------- формат ответа/ошибки */

export interface ApiErrorBody {
  error: {
    code: string
    message: string
    /** Ошибки по конкретным полям формы: { phone: 'Некорректный номер' }. */
    fields?: Record<string, string>
  }
}
