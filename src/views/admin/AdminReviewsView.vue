<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Review, ReviewStatus } from '@shared/types'
import { ApiError, api } from '@/api'
import { useAsyncData } from '@/composables/useAsyncData'
import { useUiStore } from '@/stores/ui'
import AppIcon from '@/components/ui/AppIcon.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import StarRating from '@/components/ui/StarRating.vue'

/**
 * Модерация отзывов: новые отзывы приходят со статусом pending
 * и попадают на сайт только после «Одобрить».
 */
const ui = useUiStore()
const { data: reviews, pending, error, load } = useAsyncData<Review[]>(() => api.admin.reviews.list(), [])

const filters = [
  { value: 'pending', label: 'На модерации' },
  { value: 'approved', label: 'Опубликованные' },
  { value: 'rejected', label: 'Скрытые' },
  { value: 'all', label: 'Все' },
] as const

const filter = ref<(typeof filters)[number]['value']>('pending')
/** id отзыва, по которому сейчас идёт запрос — блокируем его кнопки. */
const busyId = ref<string | null>(null)

const counts = computed(() => ({
  pending: reviews.value.filter((review) => review.status === 'pending').length,
  approved: reviews.value.filter((review) => review.status === 'approved').length,
  rejected: reviews.value.filter((review) => review.status === 'rejected').length,
  all: reviews.value.length,
}))

const visible = computed(() =>
  filter.value === 'all'
    ? reviews.value
    : reviews.value.filter((review) => review.status === filter.value),
)

const statusLabel: Record<ReviewStatus, string> = {
  pending: 'На модерации',
  approved: 'На сайте',
  rejected: 'Скрыт',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' })
}

async function setStatus(review: Review, status: ReviewStatus) {
  busyId.value = review.id
  try {
    const updated = await api.admin.reviews.setStatus(review.id, status)
    reviews.value = reviews.value.map((item) => (item.id === review.id ? updated : item))
    ui.notify(status === 'approved' ? 'Отзыв опубликован' : 'Отзыв скрыт с сайта', 'success')
  } catch (cause) {
    ui.notify(cause instanceof ApiError ? cause.message : 'Не удалось сохранить', 'error')
  } finally {
    busyId.value = null
  }
}

async function remove(review: Review) {
  if (!window.confirm(`Удалить отзыв от «${review.authorName}» навсегда?`)) return

  busyId.value = review.id
  try {
    await api.admin.reviews.remove(review.id)
    reviews.value = reviews.value.filter((item) => item.id !== review.id)
    ui.notify('Отзыв удалён', 'success')
  } catch (cause) {
    ui.notify(cause instanceof ApiError ? cause.message : 'Не удалось удалить', 'error')
  } finally {
    busyId.value = null
  }
}
</script>

<template>
  <div>
    <header class="admin__head">
      <div>
        <h1 class="admin__title">Отзывы гостей</h1>
        <p class="admin__subtitle">
          Новые отзывы ждут проверки. На сайте показываются только опубликованные.
        </p>
      </div>

      <div class="admin-tabs">
        <button
          v-for="item in filters"
          :key="item.value"
          class="admin-tab"
          type="button"
          :class="{ 'is-on': filter === item.value }"
          @click="filter = item.value"
        >
          {{ item.label }} · {{ counts[item.value] }}
        </button>
      </div>
    </header>

    <div v-if="pending" class="list">
      <div v-for="n in 3" :key="n" class="skeleton list__skeleton" />
    </div>

    <div v-else-if="error" class="admin-empty">
      <p>{{ error }}</p>
      <BaseButton variant="outline" size="sm" @click="load">Повторить</BaseButton>
    </div>

    <div v-else-if="visible.length === 0" class="admin-empty">
      Здесь пока пусто. Отзывы появятся, когда гости заполнят форму на сайте.
    </div>

    <TransitionGroup v-else name="row" tag="div" class="list">
      <article v-for="review in visible" :key="review.id" class="admin-card row">
        <div class="row__head">
          <div>
            <div class="row__author">{{ review.authorName }}</div>
            <div class="row__date">{{ formatDate(review.createdAt) }}</div>
          </div>

          <div class="row__meta">
            <StarRating :model-value="review.rating" readonly show-empty :size="15" />
            <span class="admin-badge" :class="`admin-badge--${review.status}`">
              {{ statusLabel[review.status] }}
            </span>
          </div>
        </div>

        <p class="row__text">{{ review.text }}</p>

        <div class="row__actions">
          <BaseButton
            v-if="review.status !== 'approved'"
            variant="primary"
            size="sm"
            :disabled="busyId === review.id"
            @click="setStatus(review, 'approved')"
          >
            <AppIcon name="check" :size="14" :stroke-width="2.4" /> Одобрить
          </BaseButton>

          <BaseButton
            v-if="review.status !== 'rejected'"
            variant="outline"
            size="sm"
            :disabled="busyId === review.id"
            @click="setStatus(review, 'rejected')"
          >
            <AppIcon name="eye-off" :size="14" /> Скрыть
          </BaseButton>

          <BaseButton variant="ghost" size="sm" :disabled="busyId === review.id" @click="remove(review)">
            <AppIcon name="trash" :size="14" /> Удалить
          </BaseButton>
        </div>
      </article>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.list { display: flex; flex-direction: column; gap: 14px; }
.list__skeleton { height: 150px; border-radius: 3px; }

.row__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.row__author { font-family: var(--font-display); font-weight: 700; font-size: 16px; }
.row__date { font-size: 12.5px; color: var(--ink-soft); margin-top: 2px; }
.row__meta { display: flex; align-items: center; gap: 12px; }

.row__text {
  margin: 14px 0 18px;
  font-size: 14.5px;
  line-height: 1.7;
  color: var(--ink);
}

.row__actions { display: flex; gap: 10px; flex-wrap: wrap; }

.row-enter-active { transition: opacity 0.4s var(--ease-out), transform 0.45s var(--ease-out); }
.row-leave-active { transition: opacity 0.25s var(--ease-in-out), transform 0.25s var(--ease-in-out); position: absolute; }
.row-enter-from { opacity: 0; transform: translateY(18px); }
.row-leave-to { opacity: 0; transform: translateX(-30px); }
.row-move { transition: transform 0.35s var(--ease-out); }
</style>
