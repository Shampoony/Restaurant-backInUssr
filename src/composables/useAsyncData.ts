import { onMounted, ref, shallowRef, type Ref } from 'vue'
import { ApiError } from '@/api'

interface UseAsyncDataOptions {
  /** Загружать сразу при монтировании компонента. */
  immediate?: boolean
}

interface UseAsyncData<T> {
  data: Ref<T>
  pending: Ref<boolean>
  error: Ref<string | null>
  load: () => Promise<void>
}

/**
 * Загрузка данных с сервера с состояниями «грузится / ошибка / готово».
 * Нужен, чтобы каждая страница не переписывала один и тот же try/catch.
 */
export function useAsyncData<T>(
  loader: () => Promise<T>,
  initial: T,
  options: UseAsyncDataOptions = {},
): UseAsyncData<T> {
  const data = shallowRef(initial) as Ref<T>
  const pending = ref(false)
  const error = ref<string | null>(null)

  async function load() {
    pending.value = true
    error.value = null
    try {
      data.value = await loader()
    } catch (cause) {
      error.value =
        cause instanceof ApiError ? cause.message : 'Не удалось загрузить данные'
    } finally {
      pending.value = false
    }
  }

  if (options.immediate !== false) {
    onMounted(load)
  }

  return { data, pending, error, load }
}
