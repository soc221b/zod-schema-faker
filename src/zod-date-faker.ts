import { z } from 'zod'
import { runFake } from './random'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodDateFaker extends ZodTypeFaker<z.ZodDate> {
  fake(): z.infer<z.ZodDate> {
    let min: undefined | number = undefined
    let max: undefined | number = undefined
    for (const check of this.schema._def.checks) {
      switch (check.kind) {
        case 'min':
          min = check.value
          break
        case 'max':
          max = check.value
          break
        /* istanbul ignore next */
        default: {
          const _: never = check
        }
      }
    }
    if (min === undefined) {
      if (runFake(faker => faker.datatype.boolean({ probability: 0.2 }))) {
        min = -8640000000000000
      } else {
        min = (max ?? Date.now()) - 31536000000
      }
    }
    if (max === undefined) {
      if (runFake(faker => faker.datatype.boolean({ probability: 0.2 }))) {
        max = 8640000000000000
      } else {
        max = (min ?? Date.now()) + 31536000000
      }
    }

    return runFake(faker => faker.date.between({ from: min, to: max }))
  }
}
