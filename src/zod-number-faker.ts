import { z } from 'zod'
import { runFake } from './random'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodNumberFaker extends ZodTypeFaker<z.ZodNumber> {
  fake(): z.infer<z.ZodNumber> {
    let min: undefined | number = undefined
    let max: undefined | number = undefined
    let multipleOf: undefined | number = undefined
    let int: boolean = false
    let finite: boolean = false
    for (const check of this.schema._def.checks) {
      switch (check.kind) {
        case 'min':
          min = check.value + (check.inclusive ? 0 : 0.000000000000001)
          break
        case 'max':
          max = check.value - (check.inclusive ? 0 : 0.000000000000001)
          break
        case 'multipleOf':
          multipleOf = check.value
          break
        case 'int':
          int = true
          break
        case 'finite':
          finite = true
          break
        default:
          const _: never = check
      }
    }

    if (multipleOf !== undefined) {
      return multipleOf
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
    const method = int ? 'int' : 'float'
    return runFake(faker => faker.number[method]({ min, max, multipleOf }))
  }

  static create(schema: z.ZodNumber): ZodNumberFaker {
    return new ZodNumberFaker(schema)
  }
}

export const zodNumberFaker: typeof ZodNumberFaker.create = ZodNumberFaker.create
