<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useBodyLock } from '@/composables/useBodyLock'
import { useContactsStore } from '@/stores/contacts'
import { useLocaleStore } from '@/stores/locale'
import { useUiStore } from '@/stores/ui'
import LangToggle from './LangToggle.vue'

/** Шапка сайта: липкая, сжимается при прокрутке, на мобильных — полноэкранное меню. */
const route = useRoute()
const ui = useUiStore()
const localeStore = useLocaleStore()
const contactsStore = useContactsStore()
const { contacts } = storeToRefs(contactsStore)
const { t, pick } = localeStore

const header = ref<HTMLElement | null>(null)
const scrolled = ref(false)
const menuOpen = ref(false)

/**
 * Шапка липкая и сжимается при прокрутке, поэтому её высоту нельзя зашивать в CSS:
 * отдаём фактическую высоту в --header-h, к ней цепляется липкая лента разделов меню.
 */
let observer: ResizeObserver | null = null

const links = computed(() => [
  { to: { name: 'home' }, label: t('nav.home') },
  { to: { name: 'menu' }, label: t('nav.menu') },
  { to: { name: 'about' }, label: t('nav.about') },
])

useBodyLock(menuOpen)

function onScroll() {
  scrolled.value = window.scrollY > 24
}

/** Фактическая высота шапки → CSS-переменная, к которой цепляются липкие блоки. */
function syncHeaderHeight() {
  const height = header.value?.offsetHeight ?? 0
  if (height > 0) document.documentElement.style.setProperty('--header-h', `${height}px`)
}

onMounted(() => {
  contactsStore.load()
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  if (header.value) {
    observer = new ResizeObserver(syncHeaderHeight)
    observer.observe(header.value)
    // шапка сжимается с анимацией — досчитываем высоту, когда переход закончился
    header.value.addEventListener('transitionend', syncHeaderHeight)
    syncHeaderHeight()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  header.value?.removeEventListener('transitionend', syncHeaderHeight)
  observer?.disconnect()
})

watch(() => route.fullPath, () => (menuOpen.value = false))

/* шапка меняет высоту только в момент «сжатия» — пересчитываем до и после анимации */
watch(scrolled, () => {
  syncHeaderHeight()
  window.setTimeout(syncHeaderHeight, 500)
})
</script>

<template>
  <header ref="header" class="topnav" :class="{ 'is-scrolled': scrolled }">
    <RouterLink class="brand" :to="{ name: 'home' }">
      <img class="brand__logo" src="/assets/logo.png" alt="" />
      <span class="brand__name">{{ t('hero.title.line1') }} {{ t('hero.title.line2') }}</span>
    </RouterLink>

    <nav class="navlinks">
      <RouterLink v-for="link in links" :key="link.label" class="navlinks__item" :to="link.to">
        {{ link.label }}
      </RouterLink>
    </nav>

    <div class="navmeta">
      <LangToggle class="navmeta__lang" />

      <div class="navmeta__text">
        <span>{{ pick(contacts?.openingHours) || '[Часы работы]' }}</span>
        <span>{{ contacts?.phone || '[Телефон]' }}</span>
      </div>

      <button class="navmeta__book" type="button" @click="ui.openBooking()">
        {{ t('nav.book') }}
      </button>

      <button
        class="burger"
        type="button"
        :class="{ 'is-open': menuOpen }"
        :aria-label="menuOpen ? t('nav.closeMenu') : t('nav.openMenu')"
        :aria-expanded="menuOpen"
        @click="menuOpen = !menuOpen"
      >
        <span />
      </button>
    </div>

    <Transition name="panel">
      <div v-if="menuOpen" class="panel">
        <div class="panel__top">
          <LangToggle />
          <button class="panel__close" type="button" :aria-label="t('nav.closeMenu')" @click="menuOpen = false">
            &times;
          </button>
        </div>

        <RouterLink
          v-for="(link, index) in links"
          :key="link.label"
          class="panel__item"
          :to="link.to"
          :style="{ '--i': index }"
          @click="menuOpen = false"
        >
          {{ link.label }}
        </RouterLink>

        <button
          class="panel__item panel__item--cta"
          type="button"
          :style="{ '--i': links.length }"
          @click="((menuOpen = false), ui.openBooking())"
        >
          {{ t('nav.book') }}
        </button>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.topnav {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 18px var(--page-pad);
  background: var(--paper);
  border-bottom: 3px solid var(--ink);
  transition: padding var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out),
    background var(--dur-base) var(--ease-out);
}
.topnav.is-scrolled {
  padding-top: 10px;
  padding-bottom: 10px;
  box-shadow: 0 10px 30px oklch(14% 0.02 40 / 0.09);
  background: oklch(97% 0.014 75 / 0.92);
  backdrop-filter: blur(10px);
}

/* --- логотип --- */
.brand { display: flex; align-items: center; gap: 14px; }
.brand__logo {
  width: 50px;
  height: 50px;
  transition: transform 0.7s var(--ease-spring), width var(--dur-base) var(--ease-out),
    height var(--dur-base) var(--ease-out);
}
.is-scrolled .brand__logo { width: 42px; height: 42px; }
.brand:hover .brand__logo { transform: rotate(-10deg) scale(1.08); }

.brand__name {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 19px;
  letter-spacing: 0.03em;
  color: var(--ink);
  text-transform: uppercase;
  transition: color var(--dur-fast) var(--ease-out);
}
.brand:hover .brand__name { color: var(--red); }

/* --- навигация: подчёркивание растёт от левого края --- */
.navlinks { display: flex; gap: 36px; align-items: center; }
.navlinks__item {
  position: relative;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--ink);
  padding: 6px 2px;
}
.navlinks__item::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background: var(--red);
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform var(--dur-base) var(--ease-out);
}
.navlinks__item:hover { color: var(--red); }
.navlinks__item:hover::after { transform: scaleX(1); }
.navlinks__item.router-link-active { color: var(--red); }
.navlinks__item.router-link-active::after { transform: scaleX(1); }

/* --- правая часть --- */
.navmeta { display: flex; align-items: center; gap: 18px; }
.navmeta__text {
  display: flex;
  flex-direction: column;
  font-size: 12.5px;
  color: var(--ink-soft);
  text-align: right;
  line-height: 1.5;
}

.navmeta__book {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 12.5px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--cream);
  background: var(--red-cta);
  border: 2px solid var(--red-cta);
  border-radius: 2px;
  padding: 11px 18px;
  cursor: pointer;
  transition: background var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-spring),
    box-shadow var(--dur-base) var(--ease-out);
}
.navmeta__book:hover {
  background: var(--red-deep);
  border-color: var(--red-deep);
  transform: translateY(-2px);
  box-shadow: var(--shadow-soft);
}

/* --- бургер --- */
.burger {
  display: none;
  position: relative;
  width: 42px;
  height: 38px;
  align-items: center;
  justify-content: center;
  background: none;
  border: 2px solid var(--ink);
  border-radius: 6px;
  cursor: pointer;
}
.burger span,
.burger span::before,
.burger span::after {
  content: '';
  display: block;
  width: 20px;
  height: 2px;
  background: var(--ink);
  transition: transform var(--dur-base) var(--ease-out), opacity var(--dur-fast) var(--ease-out);
}
.burger span::before { position: absolute; transform: translateY(-6px); }
.burger span::after { position: absolute; transform: translateY(6px); }
.burger.is-open span { background: transparent; }
.burger.is-open span::before { transform: rotate(45deg); }
.burger.is-open span::after { transform: rotate(-45deg); }

/* --- мобильная панель --- */
.panel {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 22px 26px;
  background: var(--paper);
}
.panel__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 26px;
}
.panel__close {
  border: none;
  background: none;
  font-size: 34px;
  line-height: 1;
  color: var(--ink);
  cursor: pointer;
  transition: transform var(--dur-base) var(--ease-spring), color var(--dur-fast) var(--ease-out);
}
.panel__close:hover { transform: rotate(90deg); color: var(--red); }

.panel__item {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 26px;
  text-transform: uppercase;
  color: var(--ink);
  text-align: left;
  padding: 14px 0;
  border: none;
  border-bottom: 1px solid var(--line);
  background: none;
  cursor: pointer;
  opacity: 0;
  transform: translateX(-24px);
  animation: panel-item 0.5s var(--ease-out) forwards;
  animation-delay: calc(120ms + var(--i) * 70ms);
}
.panel__item--cta { color: var(--red); border-bottom: none; }
.panel__item:hover { color: var(--red); }

@keyframes panel-item {
  to { opacity: 1; transform: translateX(0); }
}

.panel-enter-active { transition: opacity 0.3s var(--ease-out), clip-path 0.55s var(--ease-out); }
.panel-leave-active { transition: opacity 0.25s var(--ease-in-out); }
.panel-enter-from { opacity: 0; clip-path: circle(0% at 92% 6%); }
.panel-enter-to { clip-path: circle(140% at 92% 6%); }
.panel-leave-to { opacity: 0; }

/* --- адаптив --- */
@media (max-width: 1180px) {
  .navmeta__text { display: none; }
}
@media (max-width: 900px) {
  .navlinks,
  .navmeta__lang,
  .navmeta__book { display: none; }
  .burger { display: flex; }
}
@media (max-width: 640px) {
  .topnav { padding-top: 14px; padding-bottom: 14px; }
  .brand__name { font-size: 16px; }
  .brand__logo { width: 42px; height: 42px; }
}
</style>
