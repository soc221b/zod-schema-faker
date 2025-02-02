import { z } from 'zod'
import { runFake } from './random'
import { ZodTypeFaker } from './zod-type-faker'
import { lcm } from './utils'

export class ZodNumberFaker extends ZodTypeFaker<z.ZodNumber> {
  fake(): z.infer<z.ZodNumber> {
    let min: undefined | number = undefined
    let max: undefined | number = undefined
    let multipleOf: undefined | number = undefined
    let int: boolean = false
    let finite: boolean = false
    for (const check of this.schema._def.checks) {
      switch (check.kind) {
        case 'min': {
          const _min = check.value + (check.inclusive ? 0 : 0.000000000000001)
          min = min !== undefined ? Math.max(min, _min) : _min
          break
        }
        case 'max': {
          const _max = check.value - (check.inclusive ? 0 : 0.000000000000001)
          max = max !== undefined ? Math.min(max, _max) : _max
          break
        }
        case 'multipleOf': {
          const _multipleOf = check.value
          multipleOf = multipleOf !== undefined ? lcm(multipleOf, _multipleOf) : _multipleOf
          break
        }
        case 'int':
          int = true
          break
        case 'finite':
          finite = true
          break
        /* v8 ignore next 3 */
        default: {
          const _: never = check
        }
      }
    }

    if (finite === false && int === false && multipleOf === undefined) {
      if (min === undefined && runFake(faker => faker.datatype.boolean({ probability: 0.2 }))) {
        return -Infinity
      }
      if (max === undefined && runFake(faker => faker.datatype.boolean({ probability: 0.2 }))) {
        return Infinity
      }
    }

    min ??= Number.MIN_SAFE_INTEGER
    max ??= Number.MAX_SAFE_INTEGER
    if (min > max) {
      throw new RangeError()
    }
    const method = int ? 'int' : 'float'
    return runFake(faker => faker.number[method]({ min, max, multipleOf }))
  }
}
