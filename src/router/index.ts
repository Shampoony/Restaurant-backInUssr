import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { useAuthStore } from '@/stores/auth'

declare module 'vue-router' {
  interface RouteMeta {
    /** 'site' — шапка и подвал ресторана, 'bare' — собственная обвязка (админка). */
    chrome?: 'site' | 'bare'
    /** Роут доступен только администратору. */
    requiresAuth?: boolean
    /** Заголовок вкладки. */
    title?: string
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { chrome: 'site', title: 'Снова в СССР — ресторан советской кухни' },
  },
  {
    path: '/menu',
    name: 'menu',
    component: () => import('@/views/MenuView.vue'),
    meta: { chrome: 'site', title: 'Меню — Снова в СССР' },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
    meta: { chrome: 'site', title: 'О нас — Снова в СССР' },
  },

  /* --------------------------------------------------------- админка */
  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('@/views/admin/AdminLoginView.vue'),
    meta: { chrome: 'bare', title: 'Вход — админка' },
  },
  {
    path: '/admin',
    component: () => import('@/views/admin/AdminLayout.vue'),
    meta: { chrome: 'bare', requiresAuth: true },
    children: [
      { path: '', redirect: { name: 'admin-reviews' } },
      {
        path: 'reviews',
        name: 'admin-reviews',
        component: () => import('@/views/admin/AdminReviewsView.vue'),
        meta: { title: 'Отзывы — админка' },
      },
      {
        path: 'menu',
        name: 'admin-menu',
        component: () => import('@/views/admin/AdminMenuView.vue'),
        meta: { title: 'Меню — админка' },
      },
      {
        path: 'contacts',
        name: 'admin-contacts',
        component: () => import('@/views/admin/AdminContactsView.vue'),
        meta: { title: 'Контакты — админка' },
      },
    ],
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { chrome: 'site', title: 'Страница не найдена' },
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    if (to.hash) return { el: to.hash, behavior: 'smooth', top: 100 }
    if (to.path === from.path) return
    return { top: 0 }
  },
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.restore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'admin-login', query: { redirect: to.fullPath } }
  }
  if (to.name === 'admin-login' && auth.isAuthenticated) {
    return { name: 'admin-reviews' }
  }
  return true
})

router.afterEach((to) => {
  const title = to.matched.findLast((record) => record.meta.title)?.meta.title
  if (title) document.title = title
})
