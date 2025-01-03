import * as z from 'zod'
import { runFake } from './faker'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodBigIntFaker extends ZodTypeFaker<z.ZodBigInt> {
  fake(): z.infer<z.ZodBigInt> {
    let min: undefined | bigint = undefined
    let max: undefined | bigint = undefined
    let multipleOf: bigint = 1n
    for (const check of this.schema._def.checks) {
      switch (check.kind) {
        case 'min':
          min = check.value + (check.inclusive ? 0n : 1n)
          break
        case 'max':
          max = check.value - (check.inclusive ? 0n : 1n)
          break
        case 'multipleOf':
          multipleOf = check.value < 0n ? -check.value : check.value
          break
        default:
          const _: never = check
      }
    }
    const largeThanMultipleOf = multipleOf === undefined ? 1000n : multipleOf * 1000n
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

  static create(schema: z.ZodBigInt): ZodBigIntFaker {
    return new ZodBigIntFaker(schema)
  }
}

export const zodBigIntFaker: typeof ZodBigIntFaker.create = ZodBigIntFaker.create
