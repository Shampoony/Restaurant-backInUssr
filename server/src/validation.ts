import { HttpError } from './http.js'

type Fields = Record<string, string>

/** Мини-валидатор форм: собирает ошибки по полям и бросает 400 одним разом. */
export class Validator {
  private readonly errors: Fields = {}

  string(field: string, value: unknown, { min = 1, max = 500, label = field }: { min?: number; max?: number; label?: string } = {}): string {
    const text = typeof value === 'string' ? value.trim() : ''
    if (text.length < min) this.errors[field] = `Поле «${label}» обязательно (минимум ${min} симв.)`
    else if (text.length > max) this.errors[field] = `Поле «${label}» длиннее ${max} символов`
    return text
  }

  int(field: string, value: unknown, { min, max, label = field }: { min: number; max: number; label?: string }): number {
    const num = typeof value === 'number' ? value : Number(value)
    if (!Number.isInteger(num) || num < min || num > max) {
      this.errors[field] = `Поле «${label}» должно быть числом от ${min} до ${max}`
      return min
    }
    return num
  }

  pattern(field: string, value: unknown, regexp: RegExp, message: string): string {
    const text = typeof value === 'string' ? value.trim() : ''
    if (!regexp.test(text)) this.errors[field] = message
    return text
  }

  oneOf<T extends string>(field: string, value: unknown, allowed: readonly T[]): T {
    if (typeof value !== 'string' || !allowed.includes(value as T)) {
      this.errors[field] = `Допустимые значения: ${allowed.join(', ')}`
      return allowed[0]!
    }
    return value as T
  }

  /** Бросает HttpError 400, если хотя бы одно поле не прошло проверку. */
  done(): void {
    if (Object.keys(this.errors).length > 0) {
      throw HttpError.badRequest('Проверьте заполнение формы', this.errors)
    }
  }
}

export const PHONE_RE = /^\+?[\d\s()-]{7,20}$/
export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
export const TIME_RE = /^\d{2}:\d{2}$/
