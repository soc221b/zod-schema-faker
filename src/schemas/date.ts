import * as core from '@zod/core'
import { type fake as _fake } from '../fake'
import { getFaker } from '../random'

export function fakeDate<T extends core.$ZodDate>(schema: T, fake: typeof _fake): core.infer<T> {
  const minDate: Date = (schema as any)['minDate'] ?? new Date(-8640000000000000)
  const maxDate: Date = (schema as any)['maxDate'] ?? new Date(8640000000000000)
  return getFaker().date.between({ from: minDate, to: maxDate })
}
