<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useLocaleStore } from '@/stores/locale'
import { useUiStore } from '@/stores/ui'
import AnimatedText from '@/components/ui/AnimatedText.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import PlaceholderPhoto from '@/components/ui/PlaceholderPhoto.vue'

/** Первый экран: заголовок выезжает по словам, фотографии — с параллаксом и наклоном. */
const { t } = useLocaleStore()
const ui = useUiStore()

const mounted = ref(false)
onMounted(() => requestAnimationFrame(() => (mounted.value = true)))
</script>

<template>
  <section class="hero hatched" :class="{ 'is-ready': mounted }">
    <div class="hero__grid">
      <div class="hero__copy">
        <div class="hero__kicker" style="--in-delay: 120ms">{{ t('hero.kicker') }}</div>

        <h1 class="hero__title">
          <AnimatedText :text="t('hero.title.line1')" tag="span" class="hero__line" immediate :delay="220" />
          <AnimatedText
            :text="t('hero.title.line2')"
            tag="span"
            class="hero__line hero__line--gold"
            immediate
            :delay="420"
          />
        </h1>

        <p class="hero__sub" style="--in-delay: 720ms">{{ t('hero.sub') }}</p>

        <div class="hero__ctas" style="--in-delay: 860ms">
          <BaseButton variant="gold" :to="{ name: 'menu' }">{{ t('hero.cta.menu') }}</BaseButton>
          <BaseButton variant="outline-light" @click="ui.openBooking()">{{ t('nav.book') }}</BaseButton>
        </div>

        <div class="hero__badge" style="--in-delay: 1000ms">
          <img src="/assets/logo.png" alt="" />
          <span>{{ t('hero.badge') }}</span>
        </div>
      </div>

      <div class="hero__visual">
        <div v-parallax="0.16" class="hero__watermark" aria-hidden="true">1959</div>

        <div v-tilt class="hero__photo hero__photo--main">
          <PlaceholderPhoto :icon-size="60" />
        </div>

        <div v-tilt="{ max: 10, lift: 12 }" class="hero__photo hero__photo--sub">
          <PlaceholderPhoto :icon-size="46" />
        </div>
      </div>
    </div>

    <div class="hero__scroll" aria-hidden="true">
      <span>{{ t('hero.scroll') }}</span>
      <AppIcon name="arrow-right" :size="16" class="hero__scroll-icon" />
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  background: var(--red-deep);
  color: var(--cream);
  padding: 70px var(--page-pad) 100px;
}

.hero__grid {
  position: relative;
  z-index: 1;
  max-width: var(--page-max);
  margin: 0 auto;
  display: grid;
  grid-template-columns: 0.92fr 1fr;
  gap: 56px;
  align-items: center;
}

/* --- появление левой колонки: каждый блок со своей задержкой --- */
.hero__kicker,
.hero__sub,
.hero__ctas,
.hero__badge {
  opacity: 0;
  transform: translateY(26px);
  transition: opacity 0.8s var(--ease-out), transform 0.9s var(--ease-out);
  transition-delay: var(--in-delay, 0ms);
}
.hero.is-ready .hero__kicker,
.hero.is-ready .hero__sub,
.hero.is-ready .hero__ctas,
.hero.is-ready .hero__badge {
  opacity: 1;
  transform: none;
}

.hero__kicker {
  font-family: var(--font-script);
  font-size: 24px;
  color: var(--gold);
  margin-bottom: 10px;
}

.hero__title {
  font-family: var(--font-mega);
  font-weight: 400;
  font-size: 68px;
  line-height: 1.02;
  letter-spacing: 0.01em;
  color: var(--cream);
  margin-bottom: 22px;
}
.hero__line { display: block; }
.hero__line--gold { color: var(--gold); }

.hero__sub {
  font-size: 16px;
  line-height: 1.7;
  color: oklch(97% 0.014 75 / 0.82);
  max-width: 460px;
  margin-bottom: 34px;
}

.hero__ctas { display: flex; gap: 16px; margin-bottom: 40px; flex-wrap: wrap; }

.hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: oklch(97% 0.014 75 / 0.75);
  border-top: 1.5px dashed var(--line-on-dark);
  border-bottom: 1.5px dashed var(--line-on-dark);
  padding: 14px 0;
}
.hero__badge img {
  width: 38px;
  height: 38px;
  transition: transform 0.8s var(--ease-spring);
}
.hero__badge:hover img { transform: rotate(360deg); }

/* --- визуальная часть --- */
.hero__visual { position: relative; height: 560px; }

.hero__watermark {
  position: absolute;
  top: -30px;
  left: 0;
  width: 420px;
  height: 190px;
  display: flex;
  align-items: flex-end;
  font-family: var(--font-mega);
  font-size: 140px;
  line-height: 1;
  color: oklch(97% 0.014 75 / 0.16);
  user-select: none;
  transform: translate3d(0, var(--parallax-y, 0), 0);
}

.hero__photo {
  position: absolute;
  opacity: 0;
  animation: hero-photo 1.1s var(--ease-out) forwards;
}
.hero__photo :deep(.ph) { width: 100%; height: 100%; }

.hero__photo--main {
  top: 56px;
  right: 0;
  width: 78%;
  height: 440px;
  z-index: 1;
  border: 6px solid var(--cream);
  animation-delay: 320ms;
}
.hero__photo--sub {
  left: 0;
  bottom: 0;
  width: 46%;
  height: 220px;
  z-index: 2;
  border: 6px solid var(--gold);
  box-shadow: var(--shadow-hard);
  animation-delay: 520ms;
}

@keyframes hero-photo {
  from { opacity: 0; transform: translateY(48px) scale(0.94); }
  to { opacity: 1; transform: none; }
}

/* --- подсказка «листайте вниз» --- */
.hero__scroll {
  position: relative;
  z-index: 1;
  max-width: var(--page-max);
  margin: 40px auto 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-display);
  font-size: 11.5px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: oklch(97% 0.014 75 / 0.5);
}
.hero__scroll-icon {
  transform: rotate(90deg);
  animation: float-soft 2.4s var(--ease-in-out) infinite;
}

@media (max-width: 1080px) {
  .hero__grid { grid-template-columns: 1fr; }
  .hero__visual { height: 420px; margin-top: 20px; }
  .hero__scroll { display: none; }
}
@media (max-width: 640px) {
  .hero { padding-top: 44px; padding-bottom: 60px; }
  .hero__title { font-size: 44px; }
  .hero__sub { font-size: 14.5px; }
  .hero__visual { height: 320px; }
  .hero__photo--sub { width: 52%; height: 150px; }
  .hero__watermark { font-size: 96px; }
}
</style>
