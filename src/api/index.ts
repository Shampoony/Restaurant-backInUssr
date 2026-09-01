import type {
  AdminSession,
  Dish,
  MenuCategory,
  Reservation,
  ReservationDraft,
  ReservationStatus,
  Review,
  ReviewDraft,
  ReviewStatus,
  SiteContacts,
} from '@shared/types'
import { http } from './client'

/**
 * Описание всех эндпоинтов REST API одним местом.
 * Публичная часть — то, чем пользуется сайт; admin — то, что требует токена.
 */
export const api = {
  menu: {
    list: () => http.get<MenuCategory[]>('/menu'),
    featured: () => http.get<Dish[]>('/menu/featured'),
  },

  reviews: {
    /** Только одобренные модератором отзывы. */
    list: () => http.get<Review[]>('/reviews'),
    create: (draft: ReviewDraft) => http.post<Review>('/reviews', draft),
  },

  reservations: {
    create: (draft: ReservationDraft) => http.post<Reservation>('/reservations', draft),
  },

  contacts: {
    get: () => http.get<SiteContacts>('/contacts'),
  },

  auth: {
    login: (login: string, password: string) =>
      http.post<AdminSession>('/auth/login', { login, password }),
    logout: () => http.post<void>('/auth/logout'),
    me: () => http.get<AdminSession>('/auth/me'),
  },

  admin: {
    menu: {
      list: () => http.get<MenuCategory[]>('/admin/menu'),
      updateDish: (id: string, patch: Partial<Pick<Dish, 'name' | 'price' | 'featured' | 'hidden'>>) =>
        http.patch<Dish>(`/admin/menu/dishes/${id}`, patch),
    },
    reviews: {
      list: (status?: ReviewStatus) =>
        http.get<Review[]>(status ? `/admin/reviews?status=${status}` : '/admin/reviews'),
      setStatus: (id: string, status: ReviewStatus) =>
        http.patch<Review>(`/admin/reviews/${id}`, { status }),
      remove: (id: string) => http.delete<void>(`/admin/reviews/${id}`),
    },
    reservations: {
      list: (status?: ReservationStatus) =>
        http.get<Reservation[]>(
          status ? `/admin/reservations?status=${status}` : '/admin/reservations',
        ),
      setStatus: (id: string, status: ReservationStatus) =>
        http.patch<Reservation>(`/admin/reservations/${id}`, { status }),
    },
    contacts: {
      save: (contacts: SiteContacts) => http.put<SiteContacts>('/admin/contacts', contacts),
    },
  },
}

export { ApiError, setAuthToken } from './client'
