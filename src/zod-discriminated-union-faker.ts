import { z } from 'zod'
import { fake } from './fake'
import { runFake } from './random'
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
}
