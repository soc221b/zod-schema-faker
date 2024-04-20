import * as z from 'zod'
import { fake } from './fake'
import { runFake } from './faker'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodDiscriminatedUnionFaker<T extends z.ZodDiscriminatedUnion<any, any, any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    const options = Array.from(this.schema._def.options.values())
    const randomIndex = runFake(faker => faker.number.int({ min: 0, max: options.length - 1 }))
    const randomSchema = options[randomIndex]
    return fake(randomSchema)
  }

  static create<T extends z.ZodDiscriminatedUnion<any, any, any>>(schema: T): ZodDiscriminatedUnionFaker<T> {
    return new ZodDiscriminatedUnionFaker(schema)
  }
}

export const zodDiscriminatedUnionFaker = ZodDiscriminatedUnionFaker.create
