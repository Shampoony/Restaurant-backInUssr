<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

/** Число, которое «прокручивается» до значения, когда попадает во вьюпорт. */
const props = withDefaults(
  defineProps<{
    to: number
    from?: number
    duration?: number
  }>(),
  { from: 0, duration: 1600 },
)

const root = ref<HTMLElement | null>(null)
const value = ref(props.from)
let observer: IntersectionObserver | null = null
let frame = 0

/** Плавное замедление к концу отсчёта. */
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

function run() {
  const start = performance.now()
  const step = (now: number) => {
    const progress = Math.min((now - start) / props.duration, 1)
    value.value = Math.round(props.from + (props.to - props.from) * easeOutCubic(progress))
    if (progress < 1) frame = requestAnimationFrame(step)
  }
  frame = requestAnimationFrame(step)
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    value.value = props.to
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        run()
        observer?.disconnect()
      }
    },
    { threshold: 0.5 },
  )
  if (root.value) observer.observe(root.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  cancelAnimationFrame(frame)
})
</script>

<template>
  <span ref="root" class="count-up">{{ value }}</span>
</template>
