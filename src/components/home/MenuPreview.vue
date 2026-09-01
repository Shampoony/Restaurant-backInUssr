<script setup lang="ts">
import { api } from '@/api'
import { useAsyncData } from '@/composables/useAsyncData'
import { useLocaleStore } from '@/stores/locale'
import type { Dish } from '@shared/types'
import AnimatedText from '@/components/ui/AnimatedText.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import DishCard from '@/components/menu/DishCard.vue'

/** Подборка блюд на главной. Что показывать — решает сервер (флаг featured). */
const { t } = useLocaleStore()
const { data: dishes, pending, error, load } = useAsyncData<Dish[]>(() => api.menu.featured(), [])
</script>

<template>
  <section class="section">
    <div class="section-head">
      <div class="kicker" v-reveal>{{ t('home.menu.kicker') }}</div>
      <AnimatedText tag="h2" :text="t('home.menu.title')" />
      <p v-reveal="120">{{ t('home.menu.sub') }}</p>
    </div>

    <div class="preview">
      <div v-if="pending" class="dish-grid">
        <div v-for="n in 4" :key="n" class="skeleton preview__skeleton" />
      </div>

      <div v-else-if="error" class="preview__error">
        <p>{{ error }}</p>
        <BaseButton variant="outline" size="sm" @click="load">{{ t('common.retry') }}</BaseButton>
      </div>

      <div v-else class="dish-grid">
        <DishCard
          v-for="(dish, index) in dishes"
          :key="dish.id"
          v-reveal:scale="{ delay: index * 110 }"
          :dish="dish"
        />
      </div>
    </div>

    <div class="section-cta" v-reveal>
      <BaseButton variant="outline" :to="{ name: 'menu' }">{{ t('home.menu.cta') }}</BaseButton>
    </div>
  </section>
</template>

<style scoped>
.preview { max-width: 1180px; margin: 0 auto; }

.preview__skeleton {
  aspect-ratio: 4 / 3;
  border-radius: 2px;
}

.preview__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px 0;
  color: var(--ink-soft);
  text-align: center;
}
</style>
