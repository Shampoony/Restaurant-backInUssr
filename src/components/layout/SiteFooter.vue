<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useContactsStore } from '@/stores/contacts'
import { useLocaleStore } from '@/stores/locale'
import AppIcon from '@/components/ui/AppIcon.vue'
import type { IconName } from '@/components/ui/icons'

/** Подвал: навигация, разделы меню, контакты и соцсети. */
const { t, pick } = useLocaleStore()
const contactsStore = useContactsStore()
const { contacts } = storeToRefs(contactsStore)

const menuLinks = [
  { category: 'cold-appetizers', ru: 'Закуски', en: 'Appetizers' },
  { category: 'salads', ru: 'Салаты', en: 'Salads' },
  { category: 'main-courses', ru: 'Горячие блюда', en: 'Main Courses' },
  { category: 'desserts', ru: 'Десерты', en: 'Desserts' },
]

const socials: { icon: IconName; key: 'instagram' | 'facebook' | 'telegram' }[] = [
  { icon: 'instagram', key: 'instagram' },
  { icon: 'facebook', key: 'facebook' },
  { icon: 'telegram', key: 'telegram' },
]
</script>

<template>
  <footer class="footer">
    <div class="footer__cols wrap">
      <div v-reveal>
        <RouterLink class="footer__brand" :to="{ name: 'home' }">
          <img src="/assets/logo.png" alt="" />
          <span>{{ t('hero.title.line1') }} {{ t('hero.title.line2') }}</span>
        </RouterLink>
        <p>{{ t('footer.tagline') }}</p>
      </div>

      <div v-reveal="80">
        <h4>{{ t('footer.nav') }}</h4>
        <p><RouterLink :to="{ name: 'home' }">{{ t('nav.home') }}</RouterLink></p>
        <p><RouterLink :to="{ name: 'menu' }">{{ t('nav.menu') }}</RouterLink></p>
        <p><RouterLink :to="{ name: 'about' }">{{ t('nav.about') }}</RouterLink></p>
      </div>

      <div v-reveal="160">
        <h4>{{ t('footer.menu') }}</h4>
        <p v-for="link in menuLinks" :key="link.category">
          <RouterLink :to="{ name: 'menu', query: { category: link.category } }">
            {{ pick({ ru: link.ru, en: link.en }) }}
          </RouterLink>
        </p>
      </div>

      <div v-reveal="240">
        <h4>{{ t('footer.contacts') }}</h4>
        <p>{{ pick(contacts?.address) || '[Адрес ресторана]' }}</p>
        <p>{{ contacts?.phone || '[Телефон для брони]' }}</p>
        <p>{{ pick(contacts?.openingHours) || '[Часы работы]' }}</p>

        <div class="footer__socials">
          <a
            v-for="social in socials"
            :key="social.key"
            class="footer__social"
            :href="contacts?.social?.[social.key] || '#'"
            :aria-label="social.key"
            rel="noopener"
          >
            <AppIcon :name="social.icon" :size="16" :stroke-width="1.6" />
          </a>
        </div>
      </div>
    </div>

    <div class="footer__bottom wrap">
      <span>{{ t('footer.rights') }}</span>
      <span>{{ t('footer.prices') }}</span>
      <RouterLink class="footer__admin" :to="{ name: 'admin-login' }">{{ t('footer.admin') }}</RouterLink>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--red-deep);
  color: var(--cream);
  padding: 70px 0 30px;
}

.footer__cols {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1fr;
  gap: 40px;
  padding-bottom: 40px;
  border-bottom: 1px solid var(--line-on-dark);
}

.footer h4 {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: oklch(97% 0.014 75 / 0.55);
  margin-bottom: 16px;
}

.footer p {
  font-size: 14px;
  line-height: 1.7;
  color: oklch(97% 0.014 75 / 0.72);
  margin: 0 0 6px;
}

.footer a { color: oklch(97% 0.014 75 / 0.82); }

/* ссылки подвала подъезжают вправо и золотятся */
.footer__cols p a {
  position: relative;
  display: inline-block;
  transition: color var(--dur-fast) var(--ease-out), transform var(--dur-base) var(--ease-out);
}
.footer__cols p a::before {
  content: '★';
  position: absolute;
  left: -16px;
  font-size: 9px;
  color: var(--gold);
  opacity: 0;
  transform: translateX(-6px);
  transition: opacity var(--dur-fast) var(--ease-out), transform var(--dur-base) var(--ease-out);
}
.footer__cols p a:hover { color: var(--gold); transform: translateX(9px); }
.footer__cols p a:hover::before { opacity: 1; transform: translateX(0); }

.footer__brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 18px;
  text-transform: uppercase;
  color: var(--cream);
}
.footer__brand img {
  width: 44px;
  height: 44px;
  transition: transform 0.7s var(--ease-spring);
}
.footer__brand:hover img { transform: rotate(10deg) scale(1.08); }
.footer__brand:hover { color: var(--gold); }

.footer__socials { display: flex; gap: 12px; margin-top: 14px; }
.footer__social {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--line-on-dark);
  border-radius: 50%;
  color: var(--cream);
  transition: transform var(--dur-base) var(--ease-spring), background var(--dur-fast) var(--ease-out),
    color var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out);
}
.footer__social:hover {
  background: var(--gold);
  border-color: var(--gold);
  color: var(--red-deep);
  transform: translateY(-4px) rotate(-8deg);
}

.footer__bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding-top: 22px;
  font-size: 12.5px;
  color: oklch(97% 0.014 75 / 0.5);
}
.footer__admin { color: oklch(97% 0.014 75 / 0.5); }
.footer__admin:hover { color: var(--gold); }

@media (max-width: 1080px) {
  .footer__cols { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 640px) {
  .footer { padding-top: 50px; }
  .footer__cols { grid-template-columns: 1fr; gap: 28px; }
}
</style>
