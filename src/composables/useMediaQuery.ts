import { onBeforeUnmount, ref, type Ref } from 'vue'

/** Реактивный media-query: перестраиваем карусель под ширину экрана без window.resize. */
export function useMediaQuery(query: string): Ref<boolean> {
  const list = window.matchMedia(query)
  const matches = ref(list.matches)

  const onChange = (event: MediaQueryListEvent) => (matches.value = event.matches)
  list.addEventListener('change', onChange)
  onBeforeUnmount(() => list.removeEventListener('change', onChange))

  return matches
}
