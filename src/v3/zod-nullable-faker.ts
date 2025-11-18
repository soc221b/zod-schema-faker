import { z } from 'zod/v3'
import { fake } from './fake'
import { getFaker } from './random'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodNullableFaker<T extends z.ZodNullable<any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    return getFaker().datatype.boolean() ? null : fake(this.schema._def.innerType)
  }
}
