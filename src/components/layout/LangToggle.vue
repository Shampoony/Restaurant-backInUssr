<script setup lang="ts">
import type { Locale } from '@shared/types'
import { storeToRefs } from 'pinia'
import { useLocaleStore } from '@/stores/locale'

/** Переключатель RU/EN: активный язык подсвечивается «едущей» красной плашкой. */
const localeStore = useLocaleStore()
const { locale } = storeToRefs(localeStore)

const options: Locale[] = ['ru', 'en']
</script>

<template>
  <div class="lang" :class="`lang--${locale}`">
    <span class="lang__pill" aria-hidden="true" />
    <button
      v-for="option in options"
      :key="option"
      class="lang__btn"
      type="button"
      :class="{ 'is-on': locale === option }"
      :aria-pressed="locale === option"
      @click="localeStore.setLocale(option)"
    >
      {{ option.toUpperCase() }}
    </button>
  </div>
</template>

<style scoped>
.lang {
  position: relative;
  display: flex;
  border: 2px solid var(--ink);
  border-radius: 20px;
  overflow: hidden;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.04em;
}

/* плашка едет между RU и EN вместо резкой смены фона */
.lang__pill {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 50%;
  background: var(--red);
  transition: transform var(--dur-base) var(--ease-spring);
}
.lang--en .lang__pill { transform: translateX(100%); }

.lang__btn {
  position: relative;
  z-index: 1;
  flex: 1;
  padding: 7px 14px;
  border: none;
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  transition: color var(--dur-base) var(--ease-out);
}
.lang__btn.is-on { color: var(--cream); }
.lang__btn:not(.is-on):hover { color: var(--red); }
</style>
