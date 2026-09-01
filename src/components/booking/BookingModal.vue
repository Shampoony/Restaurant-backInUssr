<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import type { ReservationDraft } from '@shared/types'
import { ApiError, api } from '@/api'
import { useLocaleStore } from '@/stores/locale'
import { useUiStore } from '@/stores/ui'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseField from '@/components/ui/BaseField.vue'
import BaseModal from '@/components/ui/BaseModal.vue'

/**
 * Бронирование столика.
 * Форма уже ходит в REST API — под неё на сервере заведён отдельный ресурс,
 * так что подключение «настоящей» брони не потребует правок в интерфейсе.
 */
const { t } = useLocaleStore()
const ui = useUiStore()
const { bookingOpen } = storeToRefs(ui)

/** Завтрашний день по умолчанию — самый частый сценарий брони. */
function tomorrow(): string {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return date.toISOString().slice(0, 10)
}

const form = reactive<Required<ReservationDraft>>({
  guestName: '',
  phone: '',
  date: tomorrow(),
  time: '19:00',
  guests: 2,
  comment: '',
})

const errors = ref<Record<string, string>>({})
const sending = ref(false)

function reset() {
  form.guestName = ''
  form.phone = ''
  form.date = tomorrow()
  form.time = '19:00'
  form.guests = 2
  form.comment = ''
  errors.value = {}
}

async function submit() {
  sending.value = true
  errors.value = {}
  try {
    await api.reservations.create({ ...form, guests: Number(form.guests) })
    ui.notify(t('booking.success'), 'success')
    ui.closeBooking()
  } catch (cause) {
    if (cause instanceof ApiError) {
      errors.value = cause.fields
      if (Object.keys(cause.fields).length === 0) ui.notify(cause.message, 'error')
    }
  } finally {
    sending.value = false
  }
}

watch(bookingOpen, (open) => {
  if (open) reset()
})
</script>

<template>
  <BaseModal
    :open="bookingOpen"
    :title="t('booking.title')"
    :subtitle="t('booking.sub')"
    @close="ui.closeBooking()"
  >
    <form class="form" novalidate @submit.prevent="submit">
      <BaseField v-slot="{ id }" :label="t('booking.name')" :error="errors.guestName">
        <input :id="id" v-model="form.guestName" type="text" :placeholder="t('booking.namePlaceholder')" />
      </BaseField>

      <BaseField v-slot="{ id }" :label="t('booking.phone')" :error="errors.phone">
        <input :id="id" v-model="form.phone" type="tel" :placeholder="t('booking.phonePlaceholder')" />
      </BaseField>

      <div class="form__row">
        <BaseField v-slot="{ id }" :label="t('booking.date')" :error="errors.date">
          <input :id="id" v-model="form.date" type="date" />
        </BaseField>
        <BaseField v-slot="{ id }" :label="t('booking.time')" :error="errors.time">
          <input :id="id" v-model="form.time" type="time" step="900" />
        </BaseField>
        <BaseField v-slot="{ id }" :label="t('booking.guests')" :error="errors.guests">
          <input :id="id" v-model.number="form.guests" type="number" min="1" max="30" />
        </BaseField>
      </div>

      <BaseField v-slot="{ id }" :label="t('booking.comment')" :error="errors.comment">
        <textarea :id="id" v-model="form.comment" :placeholder="t('booking.commentPlaceholder')" />
      </BaseField>

      <BaseButton type="submit" variant="primary" block :loading="sending">
        {{ sending ? t('booking.sending') : t('booking.submit') }}
      </BaseButton>
    </form>
  </BaseModal>
</template>

<style scoped>
.form__row {
  display: grid;
  grid-template-columns: 1.2fr 1fr 0.8fr;
  gap: 14px;
}

@media (max-width: 560px) {
  .form__row { grid-template-columns: 1fr 1fr; }
}
</style>
