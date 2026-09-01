<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from './AppIcon.vue'

/**
 * Звёзды: только показ (`readonly`) или выбор оценки в форме отзыва.
 * При выборе звёзды «печатаются» с лёгкой отдачей — как штамп.
 */
const props = withDefaults(
  defineProps<{
    modelValue?: number
    readonly?: boolean
    size?: number
    /** Показывать пустые звёзды до пяти. */
    showEmpty?: boolean
  }>(),
  { modelValue: 5, readonly: true, size: 16, showEmpty: false },
)

const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const hovered = ref(0)
const stars = [1, 2, 3, 4, 5]

const isActive = (star: number) => star <= (hovered.value || props.modelValue)

function pick(star: number) {
  if (props.readonly) return
  emit('update:modelValue', star)
}
</script>

<template>
  <div
    class="stars"
    :class="{ 'stars--interactive': !readonly }"
    :role="readonly ? 'img' : 'radiogroup'"
    @pointerleave="hovered = 0"
  >
    <template v-for="star in stars" :key="star">
      <component
        :is="readonly ? 'span' : 'button'"
        v-if="!readonly || showEmpty || star <= modelValue"
        class="stars__item"
        :class="{ 'is-active': isActive(star), 'is-dim': !isActive(star) }"
        :type="readonly ? undefined : 'button'"
        :aria-label="readonly ? undefined : `${star}`"
        :aria-checked="readonly ? undefined : star === modelValue"
        :role="readonly ? undefined : 'radio'"
        :style="{ '--star-index': star }"
        @pointerenter="!readonly && (hovered = star)"
        @click="pick(star)"
      >
        <AppIcon name="star" filled :size="size" />
      </component>
    </template>
  </div>
</template>

<style scoped>
.stars {
  display: inline-flex;
  gap: 3px;
  color: var(--gold-deep);
}

.stars__item {
  display: block;
  padding: 0;
  border: none;
  background: none;
  color: inherit;
  animation: stamp-in 0.5s var(--ease-spring) backwards;
  animation-delay: calc(var(--star-index) * 70ms);
  transition: transform var(--dur-fast) var(--ease-spring), color var(--dur-fast) var(--ease-out);
}

.stars--interactive .stars__item {
  cursor: pointer;
  animation: none;
}
.stars--interactive .stars__item.is-dim { color: var(--line); }
.stars--interactive .stars__item.is-active { color: var(--gold-deep); }
.stars--interactive .stars__item:hover { transform: scale(1.25) rotate(-8deg); }
.stars--interactive .stars__item:active { transform: scale(0.92); }
</style>
