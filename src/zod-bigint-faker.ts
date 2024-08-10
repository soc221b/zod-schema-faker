import * as z from 'zod'
import { runFake } from './faker'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodBigIntFaker extends ZodTypeFaker<z.ZodBigInt> {
  fake(): z.infer<z.ZodBigInt> {
    const min = (() => {
      for (const check of this.schema._def.checks) {
        if (check.kind === 'min') {
          return check.value + (check.inclusive ? 0n : 1n)
        }
      }
      return -1_000_000n
    })()
    const max = (() => {
      for (const check of this.schema._def.checks) {
        if (check.kind === 'max') {
          return check.value + (check.inclusive ? 0n : -1n)
        }
      }
      return 1_000_000n
    })()
    for (const check of this.schema._def.checks) {
      if (check.kind === 'multipleOf') {
        const absMultipleOf = check.value < 0n ? -1n * check.value : check.value
        const r = min % check.value
        const absR = r < 0n ? -1n * r : r
        let start = min + absR
        while (start <= max) {
          if (runFake(faker => faker.datatype.boolean())) {
            return start
          } else {
            start += absMultipleOf
          }
        }
        return start <= max ? start : min + absR
      }
    }
    return runFake(faker => faker.number.bigInt({ min, max }))
  }

  static create(schema: z.ZodBigInt): ZodBigIntFaker {
    return new ZodBigIntFaker(schema)
  }
}

export const zodBigIntFaker: typeof ZodBigIntFaker.create = ZodBigIntFaker.create
