import { z } from 'zod'
import { fake } from './fake'
import { runFake } from './random'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodDiscriminatedUnionFaker<T extends z.ZodDiscriminatedUnion<any, any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    const randomSchema = runFake(faker => faker.helpers.arrayElement(this.schema.options))
    return fake(randomSchema as any)
  }
}
