import * as z from 'zod'
import { runFake } from './faker'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodBigIntFaker extends ZodTypeFaker<z.ZodBigInt> {
  fake(): z.infer<z.ZodBigInt> {
    let min: undefined | bigint = undefined
    let max: undefined | bigint = undefined
    let multipleOf: undefined | bigint = undefined
    for (const check of this.schema._def.checks) {
      switch (check.kind) {
        case 'min':
          min = check.value + (check.inclusive ? 0n : 1n)
          break
        case 'max':
          max = check.value - (check.inclusive ? 0n : 1n)
          break
        case 'multipleOf':
          multipleOf = check.value
          break
        default:
          const _: never = check
      }
    }

    // workaround: https://github.com/faker-js/faker/pull/3363
    if (min === undefined && max !== undefined && max < 0n) {
      min = max - (multipleOf === undefined ? 1_000n : multipleOf * 1_000n)
    }

    if (multipleOf !== undefined) {
      if (min !== undefined && max !== undefined) {
        return min + runFake(faker => faker.number.bigInt({ min: 0n, max: (max - min) / multipleOf })) * multipleOf
      } else if (min !== undefined) {
        return min + runFake(faker => faker.number.bigInt({ min: 0n })) * multipleOf
      } else if (max !== undefined) {
        return max - runFake(faker => faker.number.bigInt({ min: 0n })) * multipleOf
      } else {
        return runFake(faker => faker.number.bigInt({ min: 0n })) * multipleOf
      }
    } else {
      return runFake(faker => faker.number.bigInt({ min, max }))
    }
  }

  static create(schema: z.ZodBigInt): ZodBigIntFaker {
    return new ZodBigIntFaker(schema)
  }
}

export const zodBigIntFaker: typeof ZodBigIntFaker.create = ZodBigIntFaker.create
