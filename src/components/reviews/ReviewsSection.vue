<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Review } from '@shared/types'
import { api } from '@/api'
import { useAsyncData } from '@/composables/useAsyncData'
import { useMediaQuery } from '@/composables/useMediaQuery'
import { useLocaleStore } from '@/stores/locale'
import { useUiStore } from '@/stores/ui'
import AnimatedText from '@/components/ui/AnimatedText.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ReviewCard from './ReviewCard.vue'
import ReviewFormModal from './ReviewFormModal.vue'

/**
 * Живые отзывы с сервера + карусель.
 * Гость может оставить свой отзыв — он появится здесь после модерации в админке.
 */
const { t } = useLocaleStore()
const ui = useUiStore()

const { data: reviews, pending, error, load } = useAsyncData<Review[]>(() => api.reviews.list(), [])

const isNarrow = useMediaQuery('(max-width: 1080px)')
const perPage = computed(() => (isNarrow.value ? 1 : 3))
const pageCount = computed(() => Math.max(1, Math.ceil(reviews.value.length / perPage.value)))

const page = ref(0)
/** Направление перелистывания, чтобы карточки уезжали в нужную сторону. */
const direction = ref<'next' | 'prev'>('next')

const visible = computed(() =>
  reviews.value.slice(page.value * perPage.value, page.value * perPage.value + perPage.value),
)

function go(next: number) {
  direction.value = next > page.value ? 'next' : 'prev'
  page.value = (next + pageCount.value) % pageCount.value
}

watch([pageCount], () => {
  if (page.value > pageCount.value - 1) page.value = 0
})
</script>

<template>
  <section class="section">
    <div class="section-head">
      <div class="kicker" v-reveal>{{ t('reviews.kicker') }}</div>
      <AnimatedText tag="h2" :text="t('reviews.title')" />
      <p v-reveal="120">{{ t('reviews.sub') }}</p>
    </div>

    <div class="reviews">
      <div v-if="pending" class="reviews__grid">
        <div v-for="n in 3" :key="n" class="skeleton reviews__skeleton" />
      </div>

      <div v-else-if="error" class="reviews__state">
        <p>{{ error }}</p>
        <BaseButton variant="outline" size="sm" @click="load">{{ t('common.retry') }}</BaseButton>
      </div>

      <div v-else-if="reviews.length === 0" class="reviews__state" v-reveal>
        <span class="reviews__empty-mark">&rdquo;</span>
        <p>{{ t('reviews.empty') }}</p>
        <BaseButton variant="primary" @click="ui.openReviewForm()">{{ t('reviews.write') }}</BaseButton>
      </div>

      <template v-else>
        <Transition :name="`slide-${direction}`" mode="out-in">
          <div :key="page" class="reviews__grid">
            <ReviewCard v-for="review in visible" :key="review.id" :review="review" />
          </div>
        </Transition>

        <div class="reviews__controls">
          <button
            class="reviews__arrow"
            type="button"
            :aria-label="t('reviews.prev')"
            :disabled="pageCount < 2"
            @click="go(page - 1)"
          >
            <AppIcon name="arrow-left" :size="16" :stroke-width="2" />
          </button>

          <div class="reviews__dots">
            <button
              v-for="index in pageCount"
              :key="index"
              class="reviews__dot"
              type="button"
              :class="{ 'is-on': index - 1 === page }"
              :aria-label="`${index}`"
              @click="go(index - 1)"
            />
          </div>

          <button
            class="reviews__arrow"
            type="button"
            :aria-label="t('reviews.next')"
            :disabled="pageCount < 2"
            @click="go(page + 1)"
          >
            <AppIcon name="arrow-right" :size="16" :stroke-width="2" />
          </button>
        </div>

        <div class="section-cta">
          <BaseButton variant="outline" @click="ui.openReviewForm()">{{ t('reviews.write') }}</BaseButton>
        </div>
      </template>
    </div>

    <ReviewFormModal />
  </section>
</template>

<style scoped>
.reviews { max-width: var(--page-max); margin: 0 auto; }

.reviews__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  align-items: stretch;
}

.reviews__skeleton { height: 260px; border-radius: 2px; }

.reviews__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  padding: 50px 24px;
  text-align: center;
  color: var(--ink-soft);
  border: 1.5px dashed var(--line);
  border-radius: 2px;
}
.reviews__empty-mark {
  font-family: var(--font-flourish);
  font-size: 46px;
  color: var(--gold-deep);
  line-height: 0.6;
}

.reviews__controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 44px;
}

.reviews__arrow {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid var(--ink);
  border-radius: 50%;
  background: none;
  color: var(--ink);
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out),
    transform var(--dur-base) var(--ease-spring), opacity var(--dur-fast) var(--ease-out);
}
.reviews__arrow:hover:not([disabled]) {
  background: var(--red);
  border-color: var(--red);
  color: var(--cream);
  transform: scale(1.12);
}
.reviews__arrow[disabled] { opacity: 0.35; cursor: default; }

.reviews__dots { display: flex; gap: 8px; }
.reviews__dot {
  width: 8px;
  height: 8px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: var(--line);
  cursor: pointer;
  transition: width var(--dur-base) var(--ease-spring), background var(--dur-fast) var(--ease-out);
}
.reviews__dot.is-on { width: 22px; border-radius: 4px; background: var(--red); }

/* --- перелистывание --- */
.slide-next-enter-active,
.slide-prev-enter-active { transition: opacity 0.42s var(--ease-out), transform 0.5s var(--ease-out); }
.slide-next-leave-active,
.slide-prev-leave-active { transition: opacity 0.24s var(--ease-in-out), transform 0.3s var(--ease-in-out); }

.slide-next-enter-from { opacity: 0; transform: translateX(60px); }
.slide-next-leave-to { opacity: 0; transform: translateX(-40px); }
.slide-prev-enter-from { opacity: 0; transform: translateX(-60px); }
.slide-prev-leave-to { opacity: 0; transform: translateX(40px); }

@media (max-width: 1080px) {
  .reviews__grid { grid-template-columns: 1fr; }
}
</style>
