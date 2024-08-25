import * as z from 'zod'
import { fake } from './fake'
import { runFake } from './faker'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodDiscriminatedUnionFaker<T extends z.ZodDiscriminatedUnion<any, any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    const options = Array.from(
      typeof this.schema._def.options.values === 'function'
        ? this.schema._def.options.values()
        : this.schema._def.options.values,
    )
    const randomSchema = runFake(faker => faker.helpers.arrayElement(options))
    return fake(randomSchema as any)
  }

  static create<T extends z.ZodDiscriminatedUnion<any, any>>(schema: T): ZodDiscriminatedUnionFaker<T> {
    return new ZodDiscriminatedUnionFaker(schema)
  }
}

export const zodDiscriminatedUnionFaker: typeof ZodDiscriminatedUnionFaker.create = ZodDiscriminatedUnionFaker.create
