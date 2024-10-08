import * as z from 'zod'
import { fake } from './fake'
import { runFake } from './faker'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodSetFaker<T extends z.ZodSet<any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    let min = this.schema._def.minSize?.value ?? 0
    let max = this.schema._def.maxSize?.value ?? runFake(faker => faker.number.int({ min, max: min + 10 }))

    const set = new Set()
    while (set.size < min) {
      set.add(fake(this.schema._def.valueType))
    }
    while (set.size < max) {
      set.add(fake(this.schema._def.valueType))

      if (runFake(faker => faker.datatype.boolean())) {
        break
      }
    }
    return set
  }

  static create<T extends z.ZodSet<any>>(schema: T): ZodSetFaker<T> {
    return new ZodSetFaker(schema)
  }
}

export const zodSetFaker: typeof ZodSetFaker.create = ZodSetFaker.create
