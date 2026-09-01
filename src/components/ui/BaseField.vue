<script setup lang="ts">
import { useId } from 'vue'

/** Поле формы: подпись, слот под контрол и подсветка ошибки, пришедшей с сервера. */
defineProps<{
  label: string
  error?: string
  hint?: string
}>()

const id = useId()
</script>

<template>
  <label class="field" :class="{ 'field--error': !!error }" :for="id">
    <span class="field__label">{{ label }}</span>
    <slot :id="id" />
    <Transition name="field-error">
      <span v-if="error" class="field__error">{{ error }}</span>
    </Transition>
    <span v-if="hint && !error" class="field__hint">{{ hint }}</span>
  </label>
</template>

<style scoped>
.field {
  display: block;
  margin-bottom: 18px;
}

.field__label {
  display: block;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-soft);
  margin-bottom: 8px;
  transition: color var(--dur-fast) var(--ease-out);
}
.field:focus-within .field__label { color: var(--red); }
.field--error .field__label { color: var(--red); }

.field :slotted(input),
.field :slotted(textarea),
.field :slotted(select) {
  width: 100%;
  font-family: var(--font-body);
  font-size: 15px;
  color: var(--ink);
  background: var(--paper);
  border: 2px solid var(--line);
  border-radius: 2px;
  padding: 13px 15px;
  transition:
    border-color var(--dur-fast) var(--ease-out),
    box-shadow var(--dur-fast) var(--ease-out),
    transform var(--dur-fast) var(--ease-out);
}
.field :slotted(textarea) { min-height: 118px; resize: vertical; }

.field :slotted(input:hover),
.field :slotted(textarea:hover),
.field :slotted(select:hover) { border-color: oklch(14% 0.02 40 / 0.32); }

.field :slotted(input:focus),
.field :slotted(textarea:focus),
.field :slotted(select:focus) {
  outline: none;
  border-color: var(--red);
  box-shadow: 0 0 0 4px oklch(54% 0.22 27 / 0.14);
  transform: translateY(-1px);
}

.field--error :slotted(input),
.field--error :slotted(textarea),
.field--error :slotted(select) { border-color: var(--red); }

.field__error,
.field__hint {
  display: block;
  margin-top: 7px;
  font-size: 12.5px;
  line-height: 1.4;
}
.field__error { color: var(--red); }
.field__hint { color: var(--ink-soft); }

.field-error-enter-active { transition: opacity 0.24s var(--ease-out), transform 0.24s var(--ease-out); }
.field-error-enter-from { opacity: 0; transform: translateY(-4px); }
</style>
