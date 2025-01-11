import { z } from 'zod'
import { runFake } from './random'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodEnumFaker<T extends z.ZodEnum<any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    return runFake(faker => faker.helpers.arrayElement(this.schema._def.values))
  }
}
