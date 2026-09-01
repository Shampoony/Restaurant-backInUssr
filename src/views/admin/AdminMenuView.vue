<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Dish, MenuCategory } from '@shared/types'
import { ApiError, api } from '@/api'
import { useAsyncData } from '@/composables/useAsyncData'
import { useUiStore } from '@/stores/ui'
import AppIcon from '@/components/ui/AppIcon.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

/**
 * Заготовка редактора меню: цену, названия и видимость блюда уже можно править —
 * изменения уходят в API. Добавление и удаление позиций появится вместе с бэкендом.
 */
const ui = useUiStore()
const { data: categories, pending, error, load } = useAsyncData<MenuCategory[]>(
  () => api.admin.menu.list(),
  [],
)

const activeId = ref('')
const busyId = ref<string | null>(null)
/** Черновики правок: id блюда → изменённые поля. */
const drafts = ref<Record<string, { price: number; ru: string; en: string }>>({})

const activeCategory = computed(
  () => categories.value.find((category) => category.id === activeId.value) ?? categories.value[0],
)

/* черновики создаются один раз, когда меню приехало с сервера */
watch(categories, (list) => {
  const next: Record<string, { price: number; ru: string; en: string }> = {}
  for (const category of list) {
    for (const dish of category.dishes) {
      next[dish.id] = { price: dish.price, ru: dish.name.ru, en: dish.name.en }
    }
  }
  drafts.value = next
  if (!list.some((category) => category.id === activeId.value) && list[0]) {
    activeId.value = list[0].id
  }
})

function isDirty(dish: Dish): boolean {
  const draft = drafts.value[dish.id]
  if (!draft) return false
  return draft.price !== dish.price || draft.ru !== dish.name.ru || draft.en !== dish.name.en
}

function replaceDish(updated: Dish) {
  categories.value = categories.value.map((category) =>
    category.id !== updated.categoryId
      ? category
      : {
          ...category,
          dishes: category.dishes.map((dish) => (dish.id === updated.id ? updated : dish)),
        },
  )
}

async function patch(dish: Dish, changes: Parameters<typeof api.admin.menu.updateDish>[1]) {
  busyId.value = dish.id
  try {
    replaceDish(await api.admin.menu.updateDish(dish.id, changes))
    ui.notify('Сохранено', 'success')
  } catch (cause) {
    ui.notify(cause instanceof ApiError ? cause.message : 'Не удалось сохранить', 'error')
  } finally {
    busyId.value = null
  }
}

function save(dish: Dish) {
  const draft = drafts.value[dish.id]
  if (!draft) return Promise.resolve()
  return patch(dish, { price: Number(draft.price), name: { ru: draft.ru, en: draft.en } })
}
</script>

<template>
  <div>
    <header class="admin__head">
      <div>
        <h1 class="admin__title">Меню</h1>
        <p class="admin__subtitle">
          Цены и названия правятся здесь. Скрытые блюда не попадают в меню на сайте,
          отмеченные звёздочкой — показываются на главной.
        </p>
      </div>
    </header>

    <div v-if="pending" class="skeleton editor__skeleton" />

    <div v-else-if="error" class="admin-empty">
      <p>{{ error }}</p>
      <BaseButton variant="outline" size="sm" @click="load">Повторить</BaseButton>
    </div>

    <template v-else>
      <div class="admin-tabs editor__tabs">
        <button
          v-for="category in categories"
          :key="category.id"
          class="admin-tab"
          type="button"
          :class="{ 'is-on': category.id === activeCategory?.id }"
          @click="activeId = category.id"
        >
          {{ category.title.ru }} · {{ category.dishes.length }}
        </button>
      </div>

      <Transition name="page" mode="out-in">
        <div :key="activeCategory?.id" class="editor">
          <template v-for="dish in activeCategory?.dishes ?? []" :key="dish.id">
          <article v-if="drafts[dish.id]" class="admin-card dish-row">
            <div class="dish-row__names">
              <input
                v-model="drafts[dish.id]!.ru"
                class="admin-input"
                type="text"
                aria-label="Название по-русски"
              />
              <input
                v-model="drafts[dish.id]!.en"
                class="admin-input dish-row__en"
                type="text"
                aria-label="Название по-английски"
              />
            </div>

            <label class="dish-row__price">
              <input
                v-model.number="drafts[dish.id]!.price"
                class="admin-input"
                type="number"
                min="0"
                aria-label="Цена"
              />
              <span>₽</span>
            </label>

            <div class="dish-row__toggles">
              <button
                class="toggle"
                type="button"
                :class="{ 'is-on': dish.featured }"
                :disabled="busyId === dish.id"
                title="Показывать на главной"
                @click="patch(dish, { featured: !dish.featured })"
              >
                <AppIcon name="star" :size="15" :filled="dish.featured" />
              </button>

              <button
                class="toggle"
                type="button"
                :class="{ 'is-off': dish.hidden }"
                :disabled="busyId === dish.id"
                title="Скрыть из меню"
                @click="patch(dish, { hidden: !dish.hidden })"
              >
                <AppIcon :name="dish.hidden ? 'eye-off' : 'eye'" :size="15" />
              </button>
            </div>

            <BaseButton
              variant="primary"
              size="sm"
              :disabled="!isDirty(dish) || busyId === dish.id"
              @click="save(dish)"
            >
              Сохранить
            </BaseButton>
          </article>
          </template>
        </div>
      </Transition>
    </template>
  </div>
</template>

<style scoped>
.editor__tabs { margin-bottom: 22px; }
.editor__skeleton { height: 420px; border-radius: 3px; }
.editor { display: flex; flex-direction: column; gap: 12px; }

.dish-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 150px auto auto;
  align-items: center;
  gap: 16px;
  padding: 16px 18px;
}

.dish-row__names { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.dish-row__en { font-size: 13px; color: var(--ink-soft); }

.dish-row__price {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--red);
}

.dish-row__toggles { display: flex; gap: 8px; }
.toggle {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--line);
  border-radius: 50%;
  background: var(--paper);
  color: var(--ink-soft);
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease-out);
}
.toggle:hover { border-color: var(--red); color: var(--red); transform: translateY(-2px); }
.toggle.is-on { border-color: var(--gold-deep); color: var(--gold-deep); }
.toggle.is-off { border-color: var(--ink); color: var(--ink); opacity: 0.55; }

@media (max-width: 900px) {
  .dish-row { grid-template-columns: 1fr 1fr; }
}
</style>
