import * as core from '@zod/core'
import { type fake as _fake } from '../fake'
import { getFaker } from '../random'

export function fakeSet<T extends core.$ZodSet>(schema: T, fake: typeof _fake): core.infer<T> {
  let min = 0
  let max = Infinity
  for (const check of (schema._zod.def.checks ?? []) as core.$ZodChecks[]) {
    switch (check._zod.def.check) {
      case 'max_size': {
        max = check._zod.def.maximum
        break
      }
      case 'min_size': {
        min = check._zod.def.minimum
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
  const data = new Set()
  while (data.size < min) {
    data.add(fake(schema._zod.def.valueType))
  }
  while (data.size < max && getFaker().datatype.boolean()) {
    data.add(fake(schema._zod.def.valueType))
  }
  return data
}
