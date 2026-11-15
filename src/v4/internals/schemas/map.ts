import * as core from 'zod/v4/core'
import { MAX_DEPTH } from '../config'
import { Context } from '../context'
import { rootFake as internalFake } from '../fake'
import { getFaker } from '../random'
import { Infer } from '../type'

export function fakeMap<T extends core.$ZodMap>(schema: T, context: Context, rootFake: typeof internalFake): Infer<T> {
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
        min = Math.max(min, check._zod.def.size)
        max = Math.min(max, check._zod.def.size)
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
  const size = getFaker().number.int({ min, max })

  // Generated keys may collide (e.g. `z.boolean()` or `z.enum()` keys), so keep drawing until the map reaches the
  // target size, giving up after a bounded number of attempts.
  const map = new Map()
  const maxAttempts = size * 10 + 10
  for (let attempt = 0; map.size < size && attempt < maxAttempts; attempt++) {
    const key = rootFake(schema._zod.def.keyType, context)
    if (map.has(key)) {
      continue
    }
    map.set(key, rootFake(schema._zod.def.valueType, context))
  }
  if (map.size < min) {
    throw new RangeError(`Unable to generate ${min} unique keys for map`)
  }
  return map as Infer<T>
}
