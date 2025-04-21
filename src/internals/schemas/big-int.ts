import * as core from '@zod/core'
import { Context } from '../context'
import { fake as internalFake } from '../fake'
import { getFaker } from '../random'
import { Infer } from '../type'
import { lcm } from '../utils'

export function fakeBigInt<T extends core.$ZodBigInt>(
  schema: T,
  fake: typeof internalFake,
  context: Context,
): Infer<T> {
  let min = undefined
  let max = undefined
  let multipleOf = 1n
  for (const check of (schema._zod.def.checks ?? []) as core.$ZodChecks[]) {
    switch (check._zod.def.check) {
      case 'greater_than': {
        const value = BigInt(check._zod.def.value as any)
        const _min = value + (check._zod.def.inclusive ? 0n : 1n)
        min = min !== undefined ? (min > _min ? min : _min) : _min
        break
      }
      case 'less_than': {
        const value = BigInt(check._zod.def.value as any)
        const _max = value - (check._zod.def.inclusive ? 0n : 1n)
        max = max !== undefined ? (max < _max ? max : _max) : _max
        break
      }
      case 'multiple_of': {
        const value = BigInt(check._zod.def.value as any)
        const _multipleOf = value < 0n ? -value : value
        multipleOf = lcm(multipleOf, _multipleOf)
        break
      }
      default: {
        const _:
          | 'bigint_format'
          | 'length_equals'
          | 'max_length'
          | 'max_size'
          | 'mime_type'
          | 'min_length'
          | 'min_size'
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
  if (min === undefined) {
    if (max === undefined) {
      min = 0n
    } else {
      min = max - BigInt(10n)
    }
  }
  return getFaker().number.bigInt({ min, max, multipleOf })
}
