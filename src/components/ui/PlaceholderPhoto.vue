<script setup lang="ts">
import AppIcon from './AppIcon.vue'

/**
 * Заглушка вместо фотографии: фирменная штриховка, вилка-ложка и золотая точка.
 * Когда появятся снимки, достаточно передать src — разметка не изменится.
 */
withDefaults(
  defineProps<{
    src?: string | null
    alt?: string
    iconSize?: number
    /** Соотношение сторон, например '4/3'. */
    ratio?: string
  }>(),
  { src: null, alt: '', iconSize: 40, ratio: '' },
)
</script>

<template>
  <div class="ph" :style="ratio ? { aspectRatio: ratio } : undefined">
    <img v-if="src" class="ph__img" :src="src" :alt="alt" loading="lazy" />
    <template v-else>
      <AppIcon name="fork" :size="iconSize" :stroke-width="1.3" class="ph__icon" />
      <span class="ph__corner" />
      <span class="ph__glow" />
    </template>
    <slot />
  </div>
</template>

<style scoped>
.ph {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--paper-2);
  border: 1px solid var(--line);
  transition: border-color var(--dur-base) var(--ease-out);
}

/* штриховка «в косую линейку» */
.ph::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    135deg,
    oklch(54% 0.22 27 / 0.09) 0px,
    oklch(54% 0.22 27 / 0.09) 2px,
    transparent 2px,
    transparent 18px
  );
  transition: transform 1.2s var(--ease-out), opacity var(--dur-base) var(--ease-out);
}

.ph__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.9s var(--ease-out);
}

.ph__icon {
  position: relative;
  color: var(--red);
  opacity: 0.55;
  transition: transform 0.6s var(--ease-spring), opacity var(--dur-base) var(--ease-out);
}

.ph__corner {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--gold-deep);
  opacity: 0.85;
}

/* блик, который пробегает по заглушке при наведении */
.ph__glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, transparent 40%, oklch(97% 0.014 75 / 0.5) 50%, transparent 60%);
  background-size: 250% 100%;
  background-position: 200% 0;
  opacity: 0;
  transition: opacity var(--dur-fast) var(--ease-out);
}

/* --- ховер: заглушка «оживает» --- */
:global(.hoverable):hover .ph::before,
.ph:hover::before { transform: scale(1.15) rotate(2deg); }

.ph:hover .ph__icon,
:global(.hoverable):hover .ph__icon { transform: scale(1.18) rotate(-6deg); opacity: 0.75; }

.ph:hover .ph__img,
:global(.hoverable):hover .ph__img { transform: scale(1.07); }

.ph:hover .ph__corner,
:global(.hoverable):hover .ph__corner { animation: pulse-dot 1.4s var(--ease-in-out) infinite; }

.ph:hover .ph__glow,
:global(.hoverable):hover .ph__glow {
  opacity: 1;
  animation: shimmer 1.1s var(--ease-out);
}
</style>
