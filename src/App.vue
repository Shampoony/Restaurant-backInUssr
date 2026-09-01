<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BookingModal from '@/components/booking/BookingModal.vue'
import ScrollProgress from '@/components/layout/ScrollProgress.vue'
import SiteFooter from '@/components/layout/SiteFooter.vue'
import SiteHeader from '@/components/layout/SiteHeader.vue'
import ToastHost from '@/components/ui/ToastHost.vue'

/**
 * Корень приложения. Публичные страницы получают шапку, подвал и модалку брони;
 * админка живёт в собственной обвязке (meta.chrome === 'bare').
 */
const route = useRoute()
const withSiteChrome = computed(() => route.meta.chrome !== 'bare')
</script>

<template>
  <ScrollProgress v-if="withSiteChrome" />
  <SiteHeader v-if="withSiteChrome" />

  <RouterView v-slot="{ Component }">
    <Transition name="page" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>

  <SiteFooter v-if="withSiteChrome" />
  <BookingModal v-if="withSiteChrome" />
  <ToastHost />
</template>
