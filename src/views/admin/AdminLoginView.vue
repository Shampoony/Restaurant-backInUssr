<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ApiError } from '@/api'
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseField from '@/components/ui/BaseField.vue'
import '@/styles/admin.css'

/**
 * Вход в админку. Сейчас проверка идёт по логину/паролю из .env сервера —
 * место под настоящую авторизацию (JWT, роли) уже готово.
 */
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const form = reactive({ login: '', password: '' })
const errors = ref<Record<string, string>>({})
const message = ref('')
const sending = ref(false)

async function submit() {
  sending.value = true
  errors.value = {}
  message.value = ''
  try {
    await auth.login(form.login, form.password)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : null
    router.push(redirect ?? { name: 'admin-reviews' })
  } catch (cause) {
    if (cause instanceof ApiError) {
      errors.value = cause.fields
      if (Object.keys(cause.fields).length === 0) message.value = cause.message
    }
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <main class="login">
    <form class="login__card" novalidate @submit.prevent="submit">
      <RouterLink class="login__brand" :to="{ name: 'home' }">
        <img src="/assets/logo.png" alt="" />
        <span>Снова в СССР</span>
      </RouterLink>

      <h1 class="login__title">Вход для персонала</h1>
      <p class="login__sub">Раздел для сотрудников ресторана: модерация отзывов, меню и контакты.</p>

      <BaseField v-slot="{ id }" label="Логин" :error="errors.login">
        <input :id="id" v-model="form.login" type="text" autocomplete="username" placeholder="admin" />
      </BaseField>

      <BaseField v-slot="{ id }" label="Пароль" :error="errors.password">
        <input :id="id" v-model="form.password" type="password" autocomplete="current-password" placeholder="••••••••" />
      </BaseField>

      <Transition name="page">
        <p v-if="message" class="login__error">{{ message }}</p>
      </Transition>

      <BaseButton type="submit" variant="primary" block :loading="sending">
        {{ sending ? 'Проверяем…' : 'Войти' }}
      </BaseButton>

      <RouterLink class="login__back" :to="{ name: 'home' }">← на сайт</RouterLink>
    </form>
  </main>
</template>

<style scoped>
.login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 22px;
  background: var(--red-deep);
  position: relative;
  overflow: hidden;
}
.login::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(45deg, oklch(97% 0.014 75 / 0.035) 0 2px, transparent 2px 26px);
}

.login__card {
  position: relative;
  width: min(430px, 100%);
  background: var(--paper);
  border: 3px solid var(--ink);
  border-radius: 3px;
  padding: 38px 34px;
  box-shadow: var(--shadow-hard);
  animation: login-in 0.7s var(--ease-spring);
}

@keyframes login-in {
  from { opacity: 0; transform: translateY(34px) scale(0.96); }
  to { opacity: 1; transform: none; }
}

.login__brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 22px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 15px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--ink);
}
.login__brand img {
  width: 40px;
  height: 40px;
  transition: transform 0.7s var(--ease-spring);
}
.login__brand:hover img { transform: rotate(-12deg) scale(1.08); }

.login__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 24px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.login__sub { margin: 8px 0 24px; font-size: 13.5px; line-height: 1.6; color: var(--ink-soft); }

.login__error {
  margin-bottom: 16px;
  padding: 11px 14px;
  border-left: 3px solid var(--red);
  background: oklch(54% 0.22 27 / 0.08);
  font-size: 13.5px;
  color: var(--red);
}

.login__back {
  display: block;
  margin-top: 18px;
  text-align: center;
  font-size: 13px;
  color: var(--ink-soft);
}
.login__back:hover { color: var(--red); }
</style>
