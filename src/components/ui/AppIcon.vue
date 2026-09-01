<script setup lang="ts">
import { computed } from 'vue'
import { iconPaths, type IconName } from './icons'

/**
 * Единый набор иконок сайта.
 * Вместо копипасты <svg> по всем страницам: <AppIcon name="fork" :size="40" />
 */
const props = withDefaults(
  defineProps<{
    name: IconName
    size?: number
    /** Залитая иконка (звезда) вместо контурной. */
    filled?: boolean
    strokeWidth?: number
  }>(),
  { size: 20, filled: false, strokeWidth: 1.5 },
)

const d = computed(() => iconPaths[props.name])
</script>

<template>
  <svg
    class="icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    :fill="filled ? 'currentColor' : 'none'"
    :stroke="filled ? 'none' : 'currentColor'"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path :d="d" />
  </svg>
</template>

<style scoped>
.icon {
  display: block;
  flex: none;
}
</style>
