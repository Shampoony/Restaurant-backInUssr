<script setup lang="ts">
import type { Dish } from '@shared/types'
import { useLocaleStore } from '@/stores/locale'
import PlaceholderPhoto from '@/components/ui/PlaceholderPhoto.vue'

/** Карточка блюда. При наведении поднимается, фото оживает, цена подсвечивается. */
defineProps<{
  dish: Dish
  iconSize?: number
}>()

const { t, pick } = useLocaleStore()
</script>

<template>
  <article class="dish hoverable">
    <PlaceholderPhoto class="dish__photo" :src="dish.photoUrl" :icon-size="iconSize ?? 40" ratio="4/3" />
    <h3 class="dish__name">{{ pick(dish.name) }}</h3>
    <div class="dish__price">
      <span>{{ dish.price }}</span>
      <span class="dish__currency">{{ t('common.currency') }}</span>
    </div>
  </article>
</template>

<style scoped>
.dish {
  display: flex;
  flex-direction: column;
  cursor: default;
  transition: transform var(--dur-base) var(--ease-out);
}
.dish:hover { transform: translateY(-8px); }

.dish__photo {
  width: 100%;
  border-radius: 2px;
  margin-bottom: 12px;
  transition: box-shadow var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out);
}
.dish:hover .dish__photo {
  box-shadow: var(--shadow-soft);
  border-color: var(--red);
}

.dish__name {
  font-family: var(--font-body);
  font-size: 14.5px;
  font-weight: 700;
  line-height: 1.35;
  min-height: 38px;
  color: var(--ink);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color var(--dur-fast) var(--ease-out);
}
.dish:hover .dish__name { color: var(--red); }

.dish__price {
  display: flex;
  align-items: baseline;
  gap: 3px;
  margin-top: 8px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 17px;
  color: var(--red);
  transition: transform var(--dur-base) var(--ease-spring);
}
.dish:hover .dish__price { transform: translateX(4px); }
.dish__currency { font-size: 14px; }
</style>
