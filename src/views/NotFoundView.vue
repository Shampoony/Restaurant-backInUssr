<script setup lang="ts">
import { useLocaleStore } from '@/stores/locale'
import AnimatedText from '@/components/ui/AnimatedText.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const { t } = useLocaleStore()
</script>

<template>
  <main class="nf hatched">
    <div class="nf__code">404</div>
    <AnimatedText tag="h1" class="nf__title" :text="t('common.notFound')" immediate />
    <BaseButton variant="gold" :to="{ name: 'home' }">{{ t('common.toHome') }}</BaseButton>
  </main>
</template>

<style scoped>
.nf {
  min-height: 62vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 80px var(--page-pad);
  background: var(--red-deep);
  color: var(--cream);
  text-align: center;
}
.nf__code {
  font-family: var(--font-mega);
  font-size: clamp(80px, 18vw, 180px);
  line-height: 1;
  color: oklch(97% 0.014 75 / 0.16);
  animation: float-soft 6s var(--ease-in-out) infinite;
}
.nf__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 28px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>
