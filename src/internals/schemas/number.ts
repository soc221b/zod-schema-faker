import * as core from '@zod/core'
import { Context } from '../context'
import { fake as internalFake } from '../fake'
import { getFaker } from '../random'
import { lcm } from '../utils'

export function fakeNumber<T extends core.$ZodNumber>(
  schema: T,
  fake: typeof internalFake,
  context: Context,
): core.infer<T> {
  let min = Number.MIN_SAFE_INTEGER
  let max = Number.MAX_SAFE_INTEGER
  let multipleOf = undefined
  let int = false
  const format = (schema as unknown as core.$ZodNumberFormat)._zod.def.format
  switch (format) {
    case 'float32': {
      int = false
      break
    }
    case 'float64': {
      int = false
      break
    }
    case 'int32': {
      int = true
      min = Math.max(min, -2147483647)
      max = Math.min(max, 2147483646)
      break
    }
    case 'safeint': {
      int = true
      break
    }
    case 'uint32': {
      int = true
      min = Math.max(min, 0)
      max = Math.min(max, 4294967295)
      break
    }
    default: {
      const _: never = format
      break
    }
  }
  for (const check of (schema._zod.def.checks ?? []) as core.$ZodChecks[]) {
    switch (check._zod.def.check) {
      case 'greater_than': {
        const _min = Number(check._zod.def.value) + (check._zod.def.inclusive ? 0 : 0.000000000000001)
        min = min !== undefined ? Math.max(min, _min) : _min
        break
      }
      case 'less_than': {
        const _max = Number(check._zod.def.value) - (check._zod.def.inclusive ? 0 : 0.000000000000001)
        max = max !== undefined ? Math.min(max, _max) : _max
        break
      }
      case 'multiple_of': {
        const _multipleOf = Number(check._zod.def.value)
        multipleOf = multipleOf !== undefined ? lcm(multipleOf, _multipleOf) : _multipleOf
        break
      }
      case 'number_format': {
        const format = (check as unknown as core.$ZodNumberFormat)._zod.def.format
        switch (format) {
          case 'float32': {
            int = false
            break
          }
          case 'float64': {
            int = false
            break
          }
          case 'int32': {
            int = true
            min = Math.max(min, -2147483647)
            max = Math.min(max, 2147483646)
            break
          }
          case 'safeint': {
            int = true
            break
          }
          case 'uint32': {
            int = true
            min = Math.max(min, 0)
            max = Math.min(max, 4294967295)
            break
          }
          default: {
            const _: never = format
            break
          }
        }
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
          | 'overwrite'
          | 'property'
          | 'size_equals'
          | 'string_format'
          | never = check._zod.def.check
        break
      }
    }
  }
  if (multipleOf !== undefined && multipleOf === parseInt(multipleOf.toString(), 10)) {
    int = true
  }
  if (int) {
    return getFaker().number.int({ min, max, multipleOf })
  } else {
    return getFaker().number.float({ min, max, multipleOf })
  }
}
