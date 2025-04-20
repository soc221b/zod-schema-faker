import * as core from '@zod/core'
import { Context } from '../context'
import { fake as internalFake } from '../fake'
import { getFaker } from '../random'

export function fakeDate<T extends core.$ZodDate>(
  schema: T,
  fake: typeof internalFake,
  context: Context,
): core.infer<T> {
  const minDate: Date = schema._zod.computed['minimum'] ?? new Date(-8640000000000000)
  const maxDate: Date = schema._zod.computed['maximum'] ?? new Date(8640000000000000)
  return getFaker().date.between({ from: minDate, to: maxDate })
}
