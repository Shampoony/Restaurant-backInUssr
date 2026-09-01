<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Dish, MenuCategory } from '@shared/types'
import { api } from '@/api'
import { useAsyncData } from '@/composables/useAsyncData'
import { useLocaleStore } from '@/stores/locale'
import AnimatedText from '@/components/ui/AnimatedText.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import CategoryChips from '@/components/menu/CategoryChips.vue'
import DishCard from '@/components/menu/DishCard.vue'

/**
 * Страница меню: разделы приходят с сервера, поиск идёт по всем блюдам сразу.
 * Выбранный раздел живёт в адресе (?category=…) — ссылкой можно поделиться.
 */
const route = useRoute()
const router = useRouter()
const { t, pick } = useLocaleStore()

const { data: categories, pending, error, load } = useAsyncData<MenuCategory[]>(
  () => api.menu.list(),
  [],
)

const activeId = ref<string>(String(route.query.category ?? ''))
const search = ref('')

const dishCount = computed(() =>
  categories.value.reduce((total, category) => total + category.dishes.length, 0),
)

const activeCategory = computed(
  () => categories.value.find((category) => category.id === activeId.value) ?? categories.value[0],
)

/** Результаты поиска — плоский список по всем разделам. */
const found = computed<Dish[]>(() => {
  const query = search.value.trim().toLowerCase()
  if (query.length < 2) return []
  return categories.value
    .flatMap((category) => category.dishes)
    .filter((dish) =>
      [dish.name.ru, dish.name.en].some((name) => name.toLowerCase().includes(query)),
    )
})

const searching = computed(() => search.value.trim().length >= 2)
const visibleDishes = computed(() => (searching.value ? found.value : activeCategory.value?.dishes ?? []))

/* первый раздел выбираем, как только меню загрузилось */
watch(categories, (list) => {
  if (list.length === 0) return
  if (!list.some((category) => category.id === activeId.value)) {
    activeId.value = list[0]!.id
  }
})

watch(activeId, (id) => {
  if (!id || route.query.category === id) return
  router.replace({ query: { ...route.query, category: id } })
})

watch(
  () => route.query.category,
  (id) => {
    if (typeof id === 'string' && id && id !== activeId.value) activeId.value = id
  },
)
</script>

<template>
  <main>
    <section class="menu-hero hatched">
      <div class="menu-hero__inner">
        <div class="menu-hero__kicker">{{ t('menuPage.kicker') }}</div>
        <AnimatedText tag="h1" class="menu-hero__title" :text="t('menuPage.title')" immediate :delay="140" />
        <div class="menu-hero__sub">
          {{ t('menuPage.sub', { categories: categories.length || 12, dishes: dishCount || 69 }) }}
        </div>
      </div>
    </section>

    <CategoryChips v-if="categories.length" v-model="activeId" :categories="categories" />

    <section class="menu-body">
      <div class="menu-search">
        <label class="menu-search__box">
          <AppIcon name="search" :size="18" />
          <input
            v-model="search"
            type="search"
            :placeholder="t('menuPage.searchPlaceholder')"
            :aria-label="t('menuPage.search')"
          />
        </label>
      </div>

      <div v-if="pending" class="menu-body__inner">
        <div class="dish-grid dish-grid--wide">
          <div v-for="n in 10" :key="n" class="skeleton menu-body__skeleton" />
        </div>
      </div>

      <div v-else-if="error" class="menu-body__state">
        <p>{{ error }}</p>
        <BaseButton variant="outline" size="sm" @click="load">{{ t('common.retry') }}</BaseButton>
      </div>

      <div v-else class="menu-body__inner">
        <Transition name="cat" mode="out-in">
          <div :key="searching ? 'search' : activeCategory?.id">
            <div class="cat-head">
              <span class="star">★</span>
              <h2>{{ searching ? t('menuPage.search') : pick(activeCategory?.title) }}</h2>
              <span class="star">★</span>
            </div>

            <p v-if="searching && found.length === 0" class="menu-body__empty">
              {{ t('menuPage.nothingFound') }}
            </p>

            <div v-else class="dish-grid dish-grid--wide">
              <DishCard
                v-for="(dish, index) in visibleDishes"
                :key="dish.id"
                v-reveal:scale="{ delay: Math.min(index, 9) * 55 }"
                :dish="dish"
                :icon-size="34"
              />
            </div>
          </div>
        </Transition>
      </div>

      <div class="menu-note">
        <div class="menu-note__stamp">
          ★ ★ ★&nbsp;&nbsp;{{ t('menuPage.note') }}&nbsp;&nbsp;★ ★ ★
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.menu-hero {
  background: var(--red-deep);
  color: var(--cream);
  padding: 64px var(--page-pad) 46px;
  text-align: center;
}
.menu-hero__inner { position: relative; z-index: 1; }
.menu-hero__kicker {
  font-family: var(--font-script);
  font-size: 22px;
  color: var(--gold);
  margin-bottom: 6px;
}
.menu-hero__title {
  font-family: var(--font-mega);
  font-weight: 400;
  font-size: 56px;
  letter-spacing: 0.04em;
}
.menu-hero__sub { margin-top: 14px; font-size: 15px; color: oklch(97% 0.014 75 / 0.78); }

.menu-body { padding: 40px 0 20px; }
.menu-body__inner { max-width: var(--page-max); margin: 0 auto; padding: 0 var(--page-pad); }
.menu-body__skeleton { aspect-ratio: 4 / 3; border-radius: 2px; }
.menu-body__state,
.menu-body__empty {
  text-align: center;
  color: var(--ink-soft);
  padding: 40px var(--page-pad);
}
.menu-body__state { display: flex; flex-direction: column; align-items: center; gap: 16px; }

/* --- поиск --- */
.menu-search {
  max-width: var(--page-max);
  margin: 0 auto 34px;
  padding: 0 var(--page-pad);
  display: flex;
  justify-content: center;
}
.menu-search__box {
  display: flex;
  align-items: center;
  gap: 10px;
  width: min(420px, 100%);
  padding: 11px 16px;
  border: 2px solid var(--line);
  border-radius: 22px;
  color: var(--ink-soft);
  background: var(--paper);
  transition: border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out),
    transform var(--dur-base) var(--ease-out);
}
.menu-search__box:focus-within {
  border-color: var(--red);
  color: var(--red);
  box-shadow: 0 0 0 4px oklch(54% 0.22 27 / 0.12);
  transform: translateY(-2px);
}
.menu-search__box input {
  flex: 1;
  border: none;
  outline: none;
  background: none;
  font-family: var(--font-body);
  font-size: 14.5px;
  color: var(--ink);
}

/* --- заголовок раздела --- */
.cat-head {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  margin-bottom: 34px;
}
.cat-head h2 {
  font-family: var(--font-slab);
  font-weight: 700;
  font-size: 28px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--red);
}
.cat-head .star { animation: stamp-in 0.6s var(--ease-spring) backwards; }
.cat-head .star:last-child { animation-delay: 120ms; }

/* --- сноска --- */
.menu-note {
  max-width: var(--page-max);
  margin: 20px auto 60px;
  padding: 0 var(--page-pad);
  text-align: center;
}
.menu-note__stamp {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.03em;
  color: var(--red);
  border-top: 1.5px dashed var(--line);
  border-bottom: 1.5px dashed var(--line);
  padding: 16px 30px;
}

/* --- смена раздела --- */
.cat-enter-active { transition: opacity 0.36s var(--ease-out), transform 0.44s var(--ease-out); }
.cat-leave-active { transition: opacity 0.2s var(--ease-in-out), transform 0.24s var(--ease-in-out); }
.cat-enter-from { opacity: 0; transform: translateY(24px); }
.cat-leave-to { opacity: 0; transform: translateY(-12px); }

@media (max-width: 640px) {
  .menu-hero__title { font-size: 38px; }
  .cat-head h2 { font-size: 21px; }
}
</style>
