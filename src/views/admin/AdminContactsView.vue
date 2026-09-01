<script setup lang="ts">
import { ref, watch } from 'vue'
import type { SiteContacts } from '@shared/types'
import { ApiError, api } from '@/api'
import { useAsyncData } from '@/composables/useAsyncData'
import { useContactsStore } from '@/stores/contacts'
import { useUiStore } from '@/stores/ui'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseField from '@/components/ui/BaseField.vue'

/**
 * Заготовка редактора контактов: адрес, телефон и часы работы на двух языках.
 * Эти же значения подставляются в шапку, подвал и страницу «О нас».
 */
const ui = useUiStore()
const contactsStore = useContactsStore()

const empty: SiteContacts = {
  address: { ru: '', en: '' },
  phone: '',
  openingHours: { ru: '', en: '' },
  email: '',
  social: { instagram: '', facebook: '', telegram: '' },
}

const { data: loaded, pending, error, load } = useAsyncData<SiteContacts>(
  () => api.contacts.get(),
  empty,
)

const form = ref<SiteContacts>(structuredClone(empty))
const errors = ref<Record<string, string>>({})
const saving = ref(false)

watch(loaded, (value) => {
  form.value = structuredClone(value)
})

async function save() {
  saving.value = true
  errors.value = {}
  try {
    const saved = await api.admin.contacts.save(form.value)
    contactsStore.set(saved)
    ui.notify('Контакты сохранены', 'success')
  } catch (cause) {
    if (cause instanceof ApiError) {
      errors.value = cause.fields
      if (Object.keys(cause.fields).length === 0) ui.notify(cause.message, 'error')
    }
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <header class="admin__head">
      <div>
        <h1 class="admin__title">Контакты</h1>
        <p class="admin__subtitle">Эти данные показываются в шапке, подвале и на странице «О нас».</p>
      </div>
    </header>

    <div v-if="pending" class="skeleton contacts__skeleton" />

    <div v-else-if="error" class="admin-empty">
      <p>{{ error }}</p>
      <BaseButton variant="outline" size="sm" @click="load">Повторить</BaseButton>
    </div>

    <form v-else class="admin-card contacts" novalidate @submit.prevent="save">
      <div class="contacts__row">
        <BaseField v-slot="{ id }" label="Адрес (RU)" :error="errors['address.ru']">
          <input :id="id" v-model="form.address.ru" type="text" />
        </BaseField>
        <BaseField v-slot="{ id }" label="Адрес (EN)" :error="errors['address.en']">
          <input :id="id" v-model="form.address.en" type="text" />
        </BaseField>
      </div>

      <div class="contacts__row">
        <BaseField v-slot="{ id }" label="Часы работы (RU)" :error="errors['openingHours.ru']">
          <input :id="id" v-model="form.openingHours.ru" type="text" />
        </BaseField>
        <BaseField v-slot="{ id }" label="Часы работы (EN)" :error="errors['openingHours.en']">
          <input :id="id" v-model="form.openingHours.en" type="text" />
        </BaseField>
      </div>

      <div class="contacts__row">
        <BaseField v-slot="{ id }" label="Телефон" :error="errors.phone">
          <input :id="id" v-model="form.phone" type="tel" />
        </BaseField>
        <BaseField v-slot="{ id }" label="E-mail" :error="errors.email">
          <input :id="id" v-model="form.email" type="email" />
        </BaseField>
      </div>

      <div class="contacts__row contacts__row--three">
        <BaseField v-slot="{ id }" label="Instagram">
          <input :id="id" v-model="form.social.instagram" type="url" placeholder="https://" />
        </BaseField>
        <BaseField v-slot="{ id }" label="Facebook">
          <input :id="id" v-model="form.social.facebook" type="url" placeholder="https://" />
        </BaseField>
        <BaseField v-slot="{ id }" label="Telegram">
          <input :id="id" v-model="form.social.telegram" type="url" placeholder="https://" />
        </BaseField>
      </div>

      <BaseButton type="submit" variant="primary" :loading="saving">
        {{ saving ? 'Сохраняем…' : 'Сохранить' }}
      </BaseButton>
    </form>
  </div>
</template>

<style scoped>
.contacts { max-width: 780px; }
.contacts__skeleton { height: 420px; border-radius: 3px; }
.contacts__row { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.contacts__row--three { grid-template-columns: repeat(3, 1fr); }

@media (max-width: 760px) {
  .contacts__row,
  .contacts__row--three { grid-template-columns: 1fr; }
}
</style>
