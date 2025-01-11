import { z } from 'zod'
import { runFake } from './random'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodNativeEnumFaker<T extends z.ZodNativeEnum<any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    return runFake(faker => faker.helpers.enumValue(this.schema._def.values))
  }
}
