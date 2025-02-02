import { z } from 'zod'
import { runFake } from './random'
import { ZodTypeFaker } from './zod-type-faker'
import { lcm } from './utils'

export class ZodBigIntFaker extends ZodTypeFaker<z.ZodBigInt> {
  fake(): z.infer<z.ZodBigInt> {
    let min: undefined | bigint = undefined
    let max: undefined | bigint = undefined
    let multipleOf: bigint = 1n
    for (const check of this.schema._def.checks) {
      switch (check.kind) {
        case 'min': {
          const _min = check.value + (check.inclusive ? 0n : 1n)
          min = min !== undefined ? (min > _min ? min : _min) : _min
          break
        }
        case 'max': {
          const _max = check.value - (check.inclusive ? 0n : 1n)
          max = max !== undefined ? (max < _max ? max : _max) : _max
          break
        }
        case 'multipleOf': {
          const _multipleOf = check.value < 0n ? -check.value : check.value
          multipleOf = lcm(multipleOf, _multipleOf)
          break
        }
        /* v8 ignore next 3 */
        default: {
          const _: never = check
        }
      }
    }
    const largeThanMultipleOf = multipleOf * 1000n
    if (min !== undefined && max !== undefined) {
    } else if (min !== undefined) {
      max = min + largeThanMultipleOf
    } else if (max !== undefined) {
      min = max - largeThanMultipleOf
    } else {
      min = -largeThanMultipleOf
      max = largeThanMultipleOf
    }
    const data = min + runFake(faker => faker.number.bigInt({ min: 0n, max: (max - min) / multipleOf })) * multipleOf
    const remaining = multipleOf - ((data < 0n ? -data : data) % multipleOf)
    return data >= 0n
      ? data + remaining > max
        ? data - (multipleOf - remaining)
        : data + remaining
      : data - remaining < min
        ? data + (multipleOf - remaining)
        : data - remaining
  }
}
