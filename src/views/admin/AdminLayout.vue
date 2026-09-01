<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import AppIcon from '@/components/ui/AppIcon.vue'
import '@/styles/admin.css'

/**
 * Каркас админки: боковое меню и место под страницу.
 * Пока разделов три; добавить новый — значит добавить роут и строку в nav.
 */
const auth = useAuthStore()
const ui = useUiStore()
const router = useRouter()

const links = [
  { to: { name: 'admin-reviews' }, label: 'Отзывы', icon: 'star' },
  { to: { name: 'admin-menu' }, label: 'Меню', icon: 'fork' },
  { to: { name: 'admin-contacts' }, label: 'Контакты', icon: 'pin' },
] as const

async function logout() {
  await auth.logout()
  ui.notify('Вы вышли из админки', 'info')
  router.push({ name: 'admin-login' })
}
</script>

<template>
  <div class="admin">
    <aside class="admin__aside">
      <RouterLink class="admin__brand" :to="{ name: 'home' }">
        <img src="/assets/logo.png" alt="" />
        <span>Админка</span>
      </RouterLink>

      <nav class="admin__nav">
        <RouterLink v-for="link in links" :key="link.label" class="admin__link" :to="link.to">
          <AppIcon :name="link.icon" :size="16" />
          {{ link.label }}
        </RouterLink>
      </nav>

      <button class="admin__link admin__logout" type="button" @click="logout">
        <AppIcon name="logout" :size="16" />
        Выйти
      </button>

      <div class="admin__foot">
        {{ auth.session?.login }} · сессия до
        {{ auth.session ? new Date(auth.session.expiresAt).toLocaleTimeString('ru-RU') : '—' }}
      </div>
    </aside>

    <main class="admin__main">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>

<style scoped>
.admin__logout {
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
}
.admin__logout:hover { color: var(--gold); }
</style>
