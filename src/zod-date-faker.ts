import { z } from 'zod'
import { getFaker } from './random'
import { ZodTypeFaker } from './zod-type-faker'

export const minDateValue = -8640000000000000
export const maxDateValue = 8640000000000000

export class ZodDateFaker extends ZodTypeFaker<z.ZodDate> {
  fake(): z.infer<z.ZodDate> {
    let min: undefined | number = undefined
    let max: undefined | number = undefined
    for (const check of this.schema._def.checks) {
      switch (check.kind) {
        case 'min': {
          const _min = check.value
          min = min !== undefined ? Math.max(min, _min) : _min
          break
        }
        case 'max': {
          const _max = check.value
          max = max !== undefined ? Math.min(max, _max) : _max
          break
        }
        /* v8 ignore next 3 */
        default: {
          const _: never = check
        }
      }
    }
    if (min === undefined) {
      if (getFaker().datatype.boolean({ probability: 0.2 })) {
        min = minDateValue
      } else {
        min = (max ?? new Date('2025-01-01T00:00:00.000Z').getTime()) - 31536000000
      }
    }
    if (max === undefined) {
      if (getFaker().datatype.boolean({ probability: 0.2 })) {
        max = maxDateValue
      } else {
        max = min + 31536000000
      }
    }

    return getFaker().date.between({ from: min, to: max })
  }
}
