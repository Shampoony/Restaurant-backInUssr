<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

/**
 * Текст, который «выезжает» по словам из-под маски.
 * Используется для заголовков и подзаголовков — тот самый эффект всплывающего текста.
 */
const props = withDefaults(
  defineProps<{
    text: string
    /** Шаг задержки между словами, мс. */
    stagger?: number
    /** Стартовая задержка всей строки, мс. */
    delay?: number
    /** Тег обёртки: h1, h2, p, span… */
    tag?: string
    /** Запустить сразу после монтирования, не дожидаясь скролла (для первого экрана). */
    immediate?: boolean
  }>(),
  { stagger: 55, delay: 0, tag: 'span', immediate: false },
)

const root = ref<HTMLElement | null>(null)
const revealed = ref(false)
let observer: IntersectionObserver | null = null

const words = computed(() => props.text.split(/\s+/).filter(Boolean))

function reveal() {
  revealed.value = true
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    reveal()
    return
  }

  if (props.immediate) {
    window.setTimeout(reveal, 60)
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        reveal()
        observer?.disconnect()
      }
    },
    { threshold: 0.2, rootMargin: '0px 0px -10% 0px' },
  )
  if (root.value) observer.observe(root.value)
})

/* при смене языка строка перерисовывается — проигрываем анимацию заново */
watch(
  () => props.text,
  () => {
    if (!revealed.value) return
    revealed.value = false
    requestAnimationFrame(() => requestAnimationFrame(reveal))
  },
)

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <component :is="tag" ref="root" class="a-text" :class="{ 'is-revealed': revealed }">
    <template v-for="(word, index) in words" :key="`${word}-${index}`">
      <span class="a-text__word">
        <span class="a-text__inner" :style="{ '--word-delay': `${delay + index * stagger}ms` }">{{
          word
        }}</span>
      </span>
      <span v-if="index < words.length - 1" class="a-text__space"> </span>
    </template>
  </component>
</template>

<style scoped>
.a-text__space { display: inline-block; width: 0.28em; }
</style>
