<script setup lang="ts">
import type { MenuCategory } from '@shared/types'
import { useLocaleStore } from '@/stores/locale'

/** Липкая лента разделов меню. Активный раздел подсвечивается «плашкой». */
defineProps<{
  categories: MenuCategory[]
  modelValue: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const { pick } = useLocaleStore()

function select(id: string, event: MouseEvent) {
  emit('update:modelValue', id)
  ;(event.currentTarget as HTMLElement).scrollIntoView({
    behavior: 'smooth',
    inline: 'center',
    block: 'nearest',
  })
}
</script>

<template>
  <div class="quicknav">
    <div class="quicknav__row">
      <button
        v-for="(category, index) in categories"
        :key="category.id"
        class="chip"
        type="button"
        :class="{ 'is-on': category.id === modelValue }"
        :style="{ '--i': index }"
        @click="select(category.id, $event)"
      >
        {{ pick(category.title) }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.quicknav {
  position: sticky;
  top: var(--header-h);
  z-index: 40;
  padding: 20px var(--page-pad);
  background: var(--paper);
  border-bottom: 3px solid var(--ink);
}

.quicknav__row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.chip {
  position: relative;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 12.5px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 10px 18px;
  border: 2px solid var(--ink);
  border-radius: 20px;
  color: var(--ink);
  background: var(--paper);
  cursor: pointer;
  overflow: hidden;
  isolation: isolate;
  animation: chip-in 0.5s var(--ease-out) backwards;
  animation-delay: calc(var(--i) * 35ms);
  transition: color var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out),
    transform var(--dur-base) var(--ease-spring);
}
.chip::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: var(--red);
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform var(--dur-base) var(--ease-out);
}
.chip:hover { transform: translateY(-2px); border-color: var(--red); color: var(--cream); }
.chip:hover::before { transform: scaleX(1); }
.chip.is-on { color: var(--cream); border-color: var(--red); }
.chip.is-on::before { transform: scaleX(1); }

@keyframes chip-in {
  from { opacity: 0; transform: translateY(10px) scale(0.94); }
  to { opacity: 1; transform: none; }
}

@media (max-width: 640px) {
  .quicknav { padding: 14px var(--page-pad); }
  .quicknav__row { gap: 8px; flex-wrap: nowrap; overflow-x: auto; justify-content: flex-start; }
  .chip { padding: 8px 14px; font-size: 11px; white-space: nowrap; }
}
</style>
