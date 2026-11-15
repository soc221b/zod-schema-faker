import * as core from 'zod/v4/core'
import { MAX_DEPTH } from '../../config'
import { Context } from '../../context'
import { getFaker } from '../../random'

/**
 * Picks a target size for a `Map` or `Set` that satisfies its `min_size`, `max_size` and `size_equals` checks.
 */
export function fakeSize(checks: core.$ZodCheck<never>[] | undefined, context: Context): { min: number; size: number } {
  let min = 0
  let max = Infinity
  for (const check of (checks ?? []) as core.$ZodChecks[]) {
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
  return { min, size: getFaker().number.int({ min, max }) }
}

/**
 * Generated keys or values may collide (e.g. `z.boolean()` or `z.enum()`), so callers keep drawing until the collection
 * reaches the target size, giving up after this many attempts.
 */
export function maxAttempts(size: number): number {
  return size * 10 + 10
}
