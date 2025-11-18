import { z } from 'zod/v3'
import { getFaker } from './random'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodEnumFaker<T extends z.ZodEnum<any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    return getFaker().helpers.arrayElement(this.schema._def.values)
  }
}
