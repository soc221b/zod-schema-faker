import { z } from 'zod'
import { fake } from './fake'
import { getFaker } from './random'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodDiscriminatedUnionFaker<T extends z.ZodDiscriminatedUnion<any, any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    const randomSchema = getFaker().helpers.arrayElement(this.schema.options)
    return fake(randomSchema as any)
  }
}
