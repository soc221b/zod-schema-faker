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
 * Generated keys or values may collide (e.g. `z.boolean()` or `z.enum()`), so keep calling `add` until `collection`
 * reaches `size`, giving up after too many duplicates in a row.
 *
 * Below `min` the result would be invalid, so allow enough duplicates to collect every possible value even when there
 * are exactly `min` of them. At or above `min` the result is already valid, so stop early rather than spin on a small
 * domain (e.g. `z.set(z.boolean())` aiming for 7 values).
 */
export function fillUnique(collection: { readonly size: number }, min: number, size: number, add: () => void): void {
  let duplicates = 0
  while (collection.size < size) {
    const before = collection.size
    add()
    if (collection.size > before) {
      duplicates = 0
      continue
    }
    duplicates++
    const maxDuplicates = collection.size < min ? 100 + 30 * min : 10
    if (duplicates >= maxDuplicates) {
      break
    }
  }
}
