import * as core from '@zod/core'
import { MAX_DEPTH } from '../config'
import { Context } from '../context'
import { fake as internalFake } from '../fake'
import { getFaker } from '../random'
import { Infer } from '../type'

export function fakeSet<T extends core.$ZodSet>(schema: T, fake: typeof internalFake, context: Context): Infer<T> {
  let min = 0
  let max = Infinity
  for (const check of (schema._zod.def.checks ?? []) as core.$ZodChecks[]) {
    switch (check._zod.def.check) {
      case 'max_size': {
        max = Math.min(max, check._zod.def.maximum)
        break
      }
      case 'min_size': {
        min = Math.max(min, check._zod.def.minimum)
        break
      }
      case 'size_equals': {
        min = check._zod.def.size
        max = check._zod.def.size
        break
      }
      default: {
        const _:
          | 'bigint_format'
          | 'greater_than'
          | 'length_equals'
          | 'less_than'
          | 'max_length'
          | 'mime_type'
          | 'min_length'
          | 'multiple_of'
          | 'number_format'
          | 'overwrite'
          | 'property'
          | 'string_format'
          | never = check._zod.def.check
        break
      }
    }
  }

  max = max === Infinity ? min + getFaker().number.int({ min: 0, max: 10 }) : max
  if (context.depth > MAX_DEPTH) {
    max = min
  }
  return new Set(getFaker().helpers.multiple(() => fake(schema._zod.def.valueType, context), { count: { min, max } }))
}
