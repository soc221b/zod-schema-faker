import * as z from 'zod'
import { fake } from './fake'
import { runFake } from './faker'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodSetFaker<T extends z.ZodSet<any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    let min = this.schema._def.minSize?.value ?? 0
    let max = this.schema._def.maxSize?.value ?? runFake(faker => faker.datatype.number({ min, max: min + 10 }))

    return new Set(
      Array(runFake(faker => faker.datatype.number({ min, max })))
        .fill(null)
        .map(() => fake(this.schema._def.valueType)),
    )
  }

  static create<T extends z.ZodSet<any>>(schema: T): ZodSetFaker<T> {
    return new ZodSetFaker(schema)
  }
}

export const zodSetFaker = ZodSetFaker.create
