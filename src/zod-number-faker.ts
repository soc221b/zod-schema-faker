import * as z from 'zod'
import { runFake } from './faker'
import { ZodTypeFaker } from './zod-type-faker'

const exponents = Array(54)
  .fill(null)
  .map((_, i) => i)

const precisions = Array(16)
  .fill(null)
  .map((_, i) => i + 1)

export class ZodNumberFaker extends ZodTypeFaker<z.ZodNumber> {
  fake(): z.infer<z.ZodNumber> {
    const { min, max, precision } = this.resolveCheck()
    const result = runFake(faker =>
      precision === 1
        ? faker.number.int({
            min: Math.ceil(min),
            max: Math.floor(max),
          })
        : faker.number.float({
            min,
            max,
            multipleOf: precision,
          }),
    )
    return this.schema.parse(result)
  }

  private resolveCheck() {
    if (
      this.schema._def.checks.some(check => check.kind === 'finite') === false &&
      this.schema._def.checks.some(check => check.kind === 'int') === false &&
      this.schema._def.checks.some(check => check.kind === 'max') === false &&
      this.schema._def.checks.some(check => check.kind === 'multipleOf') === false &&
      runFake(faker => faker.datatype.boolean())
    ) {
      return { min: Infinity, max: Infinity, precision: 1 }
    }
    if (
      this.schema._def.checks.some(check => check.kind === 'finite') === false &&
      this.schema._def.checks.some(check => check.kind === 'int') === false &&
      this.schema._def.checks.some(check => check.kind === 'min') === false &&
      this.schema._def.checks.some(check => check.kind === 'multipleOf') === false &&
      runFake(faker => faker.datatype.boolean())
    ) {
      return { min: -Infinity, max: -Infinity, precision: 1 }
    }

    let min =
      -1 * (Math.pow(2, exponents[runFake(faker => faker.number.int({ min: 0, max: exponents.length - 1 }))]) - 1)
    let max = Math.pow(2, exponents[runFake(faker => faker.number.int({ min: 0, max: exponents.length - 1 }))]) - 1
    let precision =
      1 / Math.pow(10, precisions[runFake(faker => faker.number.int({ min: 0, max: precisions.length - 1 }))])

    for (const check of this.schema._def.checks) {
      switch (check.kind) {
        case 'min':
          min = Math.max(min, check.value)
          break
        case 'max':
          max = Math.min(max, check.value)
          break
        case 'int':
          precision = 1
          break
        case 'multipleOf':
          return { min: check.value, max: check.value, precision: 0.1 }
        case 'finite':
          break
        default:
          const _: never = check
          throw Error('unimplemented')
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
        case 'finite':
        case 'int':
        case 'multipleOf':
          break
        default:
          const _: never = check
          throw Error('unimplemented')
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

export const zodNumberFaker: (schema: z.ZodNumber) => ZodNumberFaker = ZodNumberFaker.create

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
