import * as core from '@zod/core'
import { MAX_DEPTH } from '../config'
import { Context } from '../context'
import { fake as internalFake } from '../fake'
import { getFaker } from '../random'

export function fakeArray<T extends core.$ZodArray>(
  schema: T,
  fake: typeof internalFake,
  context: Context,
): core.infer<T> {
  let min = 0
  let max = Infinity
  for (const check of (schema._zod.def.checks ?? []) as core.$ZodChecks[]) {
    switch (check._zod.def.check) {
      case 'length_equals': {
        min = check._zod.def.length
        max = check._zod.def.length
        break
      }
      case 'max_length': {
        max = Math.min(max, check._zod.def.maximum)
        break
      }
      case 'min_length': {
        min = Math.max(min, check._zod.def.minimum)
        break
      }
      default: {
        const _:
          | 'bigint_format'
          | 'greater_than'
          | 'less_than'
          | 'max_size'
          | 'mime_type'
          | 'min_size'
          | 'multiple_of'
          | 'number_format'
          | 'overwrite'
          | 'property'
          | 'size_equals'
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
  return getFaker().helpers.multiple(() => fake(schema._zod.def.element, context), { count: { min, max } })
}
