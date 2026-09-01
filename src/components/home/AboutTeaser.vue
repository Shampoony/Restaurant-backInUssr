<script setup lang="ts">
import { useLocaleStore } from '@/stores/locale'
import AnimatedText from '@/components/ui/AnimatedText.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import CountUp from '@/components/ui/CountUp.vue'
import PlaceholderPhoto from '@/components/ui/PlaceholderPhoto.vue'

/** Блок «О нас» на главной: фото слева, факты справа — цифры отсчитываются на глазах. */
const { t } = useLocaleStore()
</script>

<template>
  <section class="section section--alt">
    <div class="about">
      <div v-reveal:left>
        <PlaceholderPhoto v-tilt class="about__photo" :icon-size="54" ratio="5/4" />
      </div>

      <div>
        <div class="kicker" v-reveal:right>{{ t('home.about.kicker') }}</div>
        <AnimatedText tag="h2" class="about__title" :text="t('home.about.title')" />
        <p class="about__text" v-reveal="80">{{ t('home.about.text') }}</p>

        <div class="facts">
          <div class="fact" v-reveal="{ delay: 120 }">
            <b><CountUp :to="1959" :from="1900" /></b>
            <span>{{ t('home.about.fact.year') }}</span>
          </div>
          <div class="fact" v-reveal="{ delay: 220 }">
            <b><CountUp :to="69" /></b>
            <span>{{ t('home.about.fact.dishes') }}</span>
          </div>
          <div class="fact" v-reveal="{ delay: 320 }">
            <b class="fact__gost">ГОСТ</b>
            <span>{{ t('home.about.fact.gost') }}</span>
          </div>
        </div>

        <div v-reveal="{ delay: 400 }">
          <BaseButton variant="outline" :to="{ name: 'about' }">{{ t('home.about.cta') }}</BaseButton>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about {
  max-width: var(--page-max);
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
}

.about__photo { border-radius: 2px; }

.kicker {
  font-family: var(--font-script);
  font-size: 21px;
  color: var(--red);
  margin-bottom: 8px;
}

.about__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 36px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-bottom: 18px;
}

.about__text {
  font-size: 15px;
  line-height: 1.75;
  color: var(--ink-soft);
  margin-bottom: 26px;
}

.facts { display: flex; gap: 28px; margin-bottom: 32px; flex-wrap: wrap; }
.fact b {
  display: block;
  font-family: var(--font-mega);
  font-size: 26px;
  color: var(--red);
  transition: transform var(--dur-base) var(--ease-spring);
}
.fact:hover b { transform: translateY(-4px) scale(1.05); }
.fact__gost { font-size: 22px !important; }
.fact span {
  font-size: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

@media (max-width: 1080px) {
  .about { grid-template-columns: 1fr; gap: 40px; }
}
@media (max-width: 640px) {
  .facts { gap: 18px; }
  .about__title { font-size: 28px; }
}
</style>
