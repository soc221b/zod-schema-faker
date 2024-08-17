import * as z from 'zod'
import { runFake } from './faker'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodDateFaker extends ZodTypeFaker<z.ZodDate> {
  fake(): z.infer<z.ZodDate> {
    const { min, max } = this.resolveCheck()
    return runFake(faker => faker.date.between({ from: min, to: max }))
  }

  private resolveCheck(): { min: number; max: number } {
    let min: number = 0
    let max: number = Infinity

    for (const check of this.schema._def.checks) {
      switch (check.kind) {
        case 'min':
          min = Math.max(min, check.value)
          break
        case 'max':
          max = Math.min(max, check.value)
          break
        /* istanbul ignore next */
        default: {
          const _: never = check
          throw Error('unimplemented')
        }
      }
    }

    return { min, max }
  }

  static create(schema: z.ZodDate): ZodDateFaker {
    return new ZodDateFaker(schema)
  }
}

export const zodDateFaker: typeof ZodDateFaker.create = ZodDateFaker.create
