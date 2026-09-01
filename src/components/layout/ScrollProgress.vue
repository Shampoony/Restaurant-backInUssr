<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

/** Тонкая красно-золотая полоса прогресса чтения под шапкой. */
const progress = ref(0)
let frame = 0

function measure() {
  frame = 0
  const scrollable = document.documentElement.scrollHeight - window.innerHeight
  progress.value = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0
}

function onScroll() {
  if (frame) return
  frame = requestAnimationFrame(measure)
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
  measure()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  cancelAnimationFrame(frame)
})
</script>

<template>
  <div class="progress" aria-hidden="true">
    <span class="progress__bar" :style="{ transform: `scaleX(${progress})` }" />
  </div>
</template>

<style scoped>
.progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  z-index: 55;
  pointer-events: none;
}
.progress__bar {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--red), var(--gold));
  transform-origin: left center;
  transform: scaleX(0);
  transition: transform 120ms linear;
}
</style>
