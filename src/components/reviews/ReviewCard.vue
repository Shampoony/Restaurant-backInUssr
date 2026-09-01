<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import type { Review } from '@shared/types'
import { useLocaleStore } from '@/stores/locale'
import StarRating from '@/components/ui/StarRating.vue'

/** Карточка отзыва: звёзды, текст, автор и дата визита. */
const props = defineProps<{ review: Review }>()

const { locale } = storeToRefs(useLocaleStore())

const initial = computed(() => props.review.authorName.trim().charAt(0).toUpperCase())

const visited = computed(() =>
  new Intl.DateTimeFormat(locale.value === 'en' ? 'en-GB' : 'ru-RU', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(props.review.createdAt)),
)
</script>

<template>
  <article class="review">
    <StarRating :model-value="review.rating" readonly :size="16" />
    <div class="review__quote" aria-hidden="true">&rdquo;</div>
    <p class="review__text">{{ review.text }}</p>

    <div class="review__who">
      <div class="review__avatar">{{ initial }}</div>
      <div>
        <div class="review__name">{{ review.authorName }}</div>
        <div class="review__date">{{ visited }}</div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.review {
  position: relative;
  height: 100%;
  padding: 32px;
  background: var(--paper);
  border: 1.5px solid var(--line);
  border-radius: 2px;
  transition:
    transform var(--dur-base) var(--ease-out),
    border-color var(--dur-base) var(--ease-out),
    box-shadow var(--dur-base) var(--ease-out);
}
.review::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;
  background: var(--red);
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform var(--dur-slow) var(--ease-out);
}
.review:hover {
  transform: translateY(-6px);
  border-color: oklch(14% 0.02 40 / 0.28);
  box-shadow: var(--shadow-soft);
}
.review:hover::after { transform: scaleX(1); }

.review__quote {
  position: absolute;
  top: 20px;
  right: 26px;
  font-family: var(--font-flourish);
  font-size: 34px;
  color: var(--line);
  transition: color var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-spring);
}
.review:hover .review__quote { color: var(--gold); transform: scale(1.15) rotate(-6deg); }

.review__text {
  margin: 16px 0 22px;
  font-size: 14.5px;
  line-height: 1.7;
  color: var(--ink);
  min-height: 96px;
}

.review__who { display: flex; align-items: center; gap: 12px; }
.review__avatar {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--paper-2);
  border: 1px solid var(--line);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 14px;
  color: var(--red);
  transition: background var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out),
    transform var(--dur-base) var(--ease-spring);
}
.review:hover .review__avatar {
  background: var(--red);
  color: var(--cream);
  transform: rotate(-8deg) scale(1.06);
}

.review__name { font-weight: 700; font-size: 14px; }
.review__date { font-size: 12px; color: var(--ink-soft); }

@media (max-width: 640px) {
  .review { padding: 24px; }
  .review__text { min-height: 0; }
}
</style>
