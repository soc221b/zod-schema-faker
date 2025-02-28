import { z } from 'zod'
import { getFaker } from './random'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodNativeEnumFaker<T extends z.ZodNativeEnum<any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    return getFaker().helpers.enumValue(this.schema._def.values)
  }
}
