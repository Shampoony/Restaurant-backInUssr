<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import type { ReviewDraft } from '@shared/types'
import { ApiError, api } from '@/api'
import { useLocaleStore } from '@/stores/locale'
import { useUiStore } from '@/stores/ui'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseField from '@/components/ui/BaseField.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import StarRating from '@/components/ui/StarRating.vue'

/** Форма отзыва. Отправленный отзыв уходит на модерацию в админку. */
const { t } = useLocaleStore()
const ui = useUiStore()
const { reviewFormOpen } = storeToRefs(ui)

const emit = defineEmits<{ sent: [] }>()

const form = reactive<ReviewDraft>({ authorName: '', rating: 5, text: '' })
const errors = ref<Record<string, string>>({})
const sending = ref(false)

function reset() {
  form.authorName = ''
  form.rating = 5
  form.text = ''
  errors.value = {}
}

async function submit() {
  sending.value = true
  errors.value = {}
  try {
    await api.reviews.create({ ...form })
    ui.notify(t('reviews.form.success'), 'success')
    ui.closeReviewForm()
    emit('sent')
  } catch (cause) {
    if (cause instanceof ApiError) {
      errors.value = cause.fields
      if (Object.keys(cause.fields).length === 0) ui.notify(cause.message, 'error')
    }
  } finally {
    sending.value = false
  }
}

watch(reviewFormOpen, (open) => {
  if (open) reset()
})
</script>

<template>
  <BaseModal
    :open="reviewFormOpen"
    :title="t('reviews.form.title')"
    :subtitle="t('reviews.form.sub')"
    @close="ui.closeReviewForm()"
  >
    <form class="form" novalidate @submit.prevent="submit">
      <BaseField v-slot="{ id }" :label="t('reviews.form.name')" :error="errors.authorName">
        <input :id="id" v-model="form.authorName" type="text" :placeholder="t('reviews.form.namePlaceholder')" />
      </BaseField>

      <div class="form__rating">
        <span class="form__rating-label">{{ t('reviews.form.rating') }}</span>
        <StarRating v-model="form.rating" :readonly="false" show-empty :size="26" />
        <span class="form__rating-value">{{ t('reviews.ratingValue', { value: form.rating }) }}</span>
      </div>

      <BaseField v-slot="{ id }" :label="t('reviews.form.text')" :error="errors.text">
        <textarea :id="id" v-model="form.text" :placeholder="t('reviews.form.textPlaceholder')" />
      </BaseField>

      <BaseButton type="submit" variant="primary" block :loading="sending">
        {{ sending ? t('reviews.form.sending') : t('reviews.form.submit') }}
      </BaseButton>
    </form>
  </BaseModal>
</template>

<style scoped>
.form__rating {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 22px;
}
.form__rating-label {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-soft);
}
.form__rating-value { font-size: 12.5px; color: var(--ink-soft); }
</style>
