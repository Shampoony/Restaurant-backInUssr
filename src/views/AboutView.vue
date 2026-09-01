<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useContactsStore } from '@/stores/contacts'
import { useLocaleStore } from '@/stores/locale'
import { useUiStore } from '@/stores/ui'
import AnimatedText from '@/components/ui/AnimatedText.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import PlaceholderPhoto from '@/components/ui/PlaceholderPhoto.vue'
import type { IconName } from '@/components/ui/icons'
import type { MessageKey } from '@/locales/ru'

/** Страница «О нас»: история, галерея, ценности, цитата шефа и контакты. */
const { t, pick } = useLocaleStore()
const ui = useUiStore()
const contactsStore = useContactsStore()
const { contacts } = storeToRefs(contactsStore)

const values: { icon: IconName; title: MessageKey; text: MessageKey }[] = [
  { icon: 'medal', title: 'aboutPage.value1.title', text: 'aboutPage.value1.text' },
  { icon: 'star', title: 'aboutPage.value2.title', text: 'aboutPage.value2.text' },
  { icon: 'heart', title: 'aboutPage.value3.title', text: 'aboutPage.value3.text' },
]

onMounted(() => contactsStore.load())
</script>

<template>
  <main>
    <section class="about-hero hatched">
      <div class="about-hero__inner">
        <div class="about-hero__kicker">{{ t('aboutPage.kicker') }}</div>
        <AnimatedText tag="h1" class="about-hero__title" :text="t('aboutPage.title')" immediate :delay="140" />
      </div>
    </section>

    <section class="story">
      <div class="story__lead" v-reveal>{{ t('aboutPage.storyLead') }}</div>
      <p v-reveal="100">{{ t('aboutPage.story1') }}</p>
      <p v-reveal="200">{{ t('aboutPage.story2') }}</p>
    </section>

    <section class="gallery">
      <div class="gallery__grid">
        <div v-for="n in 5" :key="n" v-reveal:scale="{ delay: n * 90 }" class="gallery__cell">
          <PlaceholderPhoto v-tilt="{ max: 6, lift: 6 }" :icon-size="n === 1 ? 64 : 46" />
        </div>
      </div>
    </section>

    <section class="values">
      <article v-for="(value, index) in values" :key="value.icon" class="value" v-reveal="{ delay: index * 120 }">
        <div class="value__icon"><AppIcon :name="value.icon" :size="30" :stroke-width="1.4" /></div>
        <h3>{{ t(value.title) }}</h3>
        <p>{{ t(value.text) }}</p>
      </article>
    </section>

    <section class="quote-band hatched">
      <div class="quote-band__mark">&laquo;</div>
      <p v-reveal>{{ t('aboutPage.quote') }}</p>
      <div class="quote-band__who">{{ t('aboutPage.quoteWho') }}</div>
    </section>

    <section class="contacts">
      <div v-reveal:left>
        <PlaceholderPhoto v-tilt class="contacts__photo" :icon-size="56" ratio="4/3" />
      </div>

      <div v-reveal:right>
        <h2 class="contacts__title">{{ t('aboutPage.contacts.title') }}</h2>

        <div class="cline">
          <AppIcon name="pin" :size="22" :stroke-width="1.6" class="cline__icon" />
          <div>
            <b>{{ t('aboutPage.contacts.address') }}</b>
            <span>{{ pick(contacts?.address) || '[Адрес ресторана]' }}</span>
          </div>
        </div>

        <div class="cline">
          <AppIcon name="phone" :size="22" :stroke-width="1.6" class="cline__icon" />
          <div>
            <b>{{ t('aboutPage.contacts.phone') }}</b>
            <span>{{ contacts?.phone || '[Телефон для брони]' }}</span>
          </div>
        </div>

        <div class="cline">
          <AppIcon name="clock" :size="22" :stroke-width="1.6" class="cline__icon" />
          <div>
            <b>{{ t('aboutPage.contacts.hours') }}</b>
            <span>{{ pick(contacts?.openingHours) || '[Часы работы]' }}</span>
          </div>
        </div>

        <BaseButton variant="primary" class="contacts__cta" @click="ui.openBooking()">
          {{ t('nav.book') }}
        </BaseButton>
      </div>
    </section>
  </main>
</template>

<style scoped>
.about-hero {
  padding: 70px var(--page-pad);
  background: var(--red-deep);
  color: var(--cream);
  text-align: center;
}
.about-hero__inner { position: relative; z-index: 1; }
.about-hero__kicker {
  font-family: var(--font-script);
  font-size: 22px;
  color: var(--gold);
  margin-bottom: 8px;
}
.about-hero__title {
  font-family: var(--font-mega);
  font-weight: 400;
  font-size: 50px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.story {
  max-width: 900px;
  margin: 0 auto;
  padding: 96px var(--page-pad);
  text-align: center;
}
.story__lead {
  font-family: var(--font-flourish);
  font-size: 22px;
  color: var(--red);
  margin-bottom: 18px;
}
.story p { font-size: 17px; line-height: 1.9; color: var(--ink); margin-bottom: 22px; }

.gallery {
  max-width: var(--page-max);
  margin: 0 auto;
  padding: 0 var(--page-pad) 100px;
}
.gallery__grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr;
  grid-template-rows: 220px 220px;
  gap: 20px;
}
.gallery__cell { min-height: 0; }
.gallery__cell:first-child { grid-row: 1 / 3; }
.gallery__cell :deep(.ph) { width: 100%; height: 100%; border-radius: 2px; }

.values {
  max-width: var(--page-max);
  margin: 0 auto;
  padding: 0 var(--page-pad) 100px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}
.value {
  padding: 36px;
  border: 1.5px solid var(--line);
  text-align: center;
  transition: transform var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out),
    box-shadow var(--dur-base) var(--ease-out), background var(--dur-base) var(--ease-out);
}
.value:hover {
  transform: translateY(-8px);
  border-color: var(--red);
  box-shadow: var(--shadow-soft);
  background: var(--paper);
}
.value__icon {
  display: flex;
  justify-content: center;
  margin: 0 auto 18px;
  color: var(--red);
  transition: transform 0.6s var(--ease-spring);
}
.value:hover .value__icon { transform: scale(1.2) rotate(-8deg); }
.value h3 {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 17px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 12px;
}
.value p { font-size: 14px; line-height: 1.7; color: var(--ink-soft); }

.quote-band {
  background: var(--red-vivid);
  color: var(--cream);
  padding: 90px var(--page-pad);
  text-align: center;
}
.quote-band__mark { font-family: var(--font-flourish); font-size: 40px; color: var(--gold); }
.quote-band p {
  max-width: 760px;
  margin: 14px auto 22px;
  font-family: var(--font-script);
  font-size: 27px;
  line-height: 1.5;
}
.quote-band__who {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: oklch(97% 0.014 75 / 0.75);
}

.contacts {
  max-width: var(--page-max);
  margin: 0 auto;
  padding: 96px var(--page-pad) 110px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
}
.contacts__photo { border-radius: 2px; }
.contacts__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 32px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-bottom: 26px;
}
.contacts__cta { margin-top: 10px; }

.cline {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 22px;
  transition: transform var(--dur-base) var(--ease-out);
}
.cline:hover { transform: translateX(6px); }
.cline__icon { color: var(--red); margin-top: 2px; }
.cline b {
  display: block;
  font-family: var(--font-display);
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-soft);
  margin-bottom: 4px;
}
.cline span { font-size: 15px; color: var(--ink); }

@media (max-width: 1080px) {
  .gallery__grid { grid-template-columns: 1fr 1fr; grid-template-rows: 180px 180px 180px; }
  .gallery__cell:first-child { grid-row: auto; grid-column: 1 / 3; height: 220px; }
  .values { grid-template-columns: 1fr; }
  .contacts { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .about-hero__title { font-size: 34px; }
  .story { padding-top: 64px; padding-bottom: 64px; }
  .story p { font-size: 15px; }
  .quote-band p { font-size: 22px; }
}
</style>
