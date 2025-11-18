import * as core from 'zod/v4/core'
import { MAX_DEPTH } from '../config'
import { Context } from '../context'
import { rootFake as internalFake } from '../fake'
import { getFaker } from '../random'
import { Infer } from '../type'

export function fakeArray<T extends core.$ZodArray>(
  schema: T,
  context: Context,
  rootFake: typeof internalFake,
): Infer<T> {
  let min: undefined | number = undefined
  let max: undefined | number = undefined
  let length: undefined | number = undefined
  for (const check of (schema._zod.def.checks ?? []) as core.$ZodChecks[]) {
    switch (check._zod.def.check) {
      case 'length_equals': {
        if (length !== undefined && length !== check._zod.def.length) {
          throw new RangeError()
        }
        length = check._zod.def.length
        break
      }
      case 'max_length': {
        max = Math.min(max ?? Infinity, check._zod.def.maximum)
        break
      }
      case 'min_length': {
        min = Math.max(min ?? 0, check._zod.def.minimum)
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

  min = min ?? length ?? 0
  max = max ?? length ?? min + 3
  if (context.depth > MAX_DEPTH) {
    max = min
  }
  return getFaker().helpers.multiple(() => rootFake(schema._zod.def.element, context), { count: { min, max } })
}
