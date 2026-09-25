import * as core from 'zod/v4/core'
import { Context } from '../context'
import { rootFake as internalFake } from '../fake'
import { getFaker } from '../random'
import { Infer } from '../type'

export function fakeDate<T extends core.$ZodDate>(
  schema: T,
  context: Context,
  rootFake: typeof internalFake,
): Infer<T> {
  let min = -8640000000000000
  let max = 8640000000000000
  for (const check of (schema._zod.def.checks ?? []) as core.$ZodChecks[]) {
    switch (check._zod.def.check) {
      case 'greater_than': {
        min = Math.max(min, Number(check._zod.def.value) + (check._zod.def.inclusive ? 0 : 1))
        break
      }
      case 'less_than': {
        max = Math.min(max, Number(check._zod.def.value) - (check._zod.def.inclusive ? 0 : 1))
        break
      }
    }
  }
  return getFaker().date.between({ from: new Date(min), to: new Date(max) })
}
