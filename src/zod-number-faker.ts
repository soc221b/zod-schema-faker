import * as z from 'zod'
import { ZodSchemaFakerError } from './error'
import { runFake } from './faker'
import { ZodTypeFaker } from './zod-type-faker'

/* TODO: this is a bit of a hack, but it works for now */
const safeCount = 1e3

const exponents = Array(54)
  .fill(null)
  .map((_, i) => i)

const precisions = Array(16)
  .fill(null)
  .map((_, i) => i + 1)

export class ZodNumberFaker extends ZodTypeFaker<z.ZodNumber> {
  fake(): z.infer<z.ZodNumber> {
    const { min, max, precision } = this.resolveCheck()

    let count = 0
    do {
      const result = runFake(faker =>
        precision === 1
          ? faker.datatype.number({
              min: Math.ceil(min),
              max: Math.floor(max),
            })
          : faker.datatype.float({
              min,
              max,
              precision,
            }),
      )
      if (this.schema.safeParse(result).success) {
        return result
      }
    } while (++count < safeCount)

    throw new ZodSchemaFakerError('Unable to generate valid values for Zod schema: ' + this.schema.toString())
  }

  private resolveCheck() {
    let min =
      -1 * (Math.pow(2, exponents[runFake(faker => faker.datatype.number({ min: 0, max: exponents.length - 1 }))]) - 1)
    let max = Math.pow(2, exponents[runFake(faker => faker.datatype.number({ min: 0, max: exponents.length - 1 }))]) - 1
    let precision =
      1 / Math.pow(10, precisions[runFake(faker => faker.datatype.number({ min: 0, max: precisions.length - 1 }))])

    for (const check of this.schema._def.checks) {
      switch (check.kind) {
        case 'min':
          min = check.value
          break
        case 'max':
          max = check.value
          break
        case 'int':
          precision = 1
          break
        case 'multipleOf':
          // step = check.value
          break
        default:
          const _: never = check
          break
      }
    }

    for (const check of this.schema._def.checks) {
      switch (check.kind) {
        case 'min':
          if (check.inclusive) {
            max = Math.max(min, max)
          } else {
            min = min + findMinimumOffsetPrecision(min)
            max = Math.max(min, max)
          }
          break
        case 'max':
          if (check.inclusive) {
            min = Math.min(min, max)
          } else {
            max = max - findMinimumOffsetPrecision(max)
            min = Math.min(min, max)
          }
          break
      }
    }

    if (max - min < 1) {
      precision = 1 / 1e16
    }

    return {
      min,
      max,
      precision,
    }
  }

  static create(schema: z.ZodNumber): ZodNumberFaker {
    return new ZodNumberFaker(schema)
  }
}

export const zodNumberFaker = ZodNumberFaker.create

function findMinimumOffsetPrecision(number: number) {
  number = Math.abs(number)
  let max = 1
  let min = 1 / 1e16
  let prevMid = max
  let mid = min + (max - min) / 2
  let count = 0
  while (++count < 99) {
    if (prevMid <= Number.EPSILON) break
    if (number + mid === number) break
    prevMid = mid
    max = mid
    mid = min + (max - min) / 2
  }
  return prevMid
}
