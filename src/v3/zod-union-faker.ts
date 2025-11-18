import { z } from 'zod/v3'
import { fake } from './fake'
import { getFaker } from './random'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodUnionFaker<T extends z.ZodUnion<any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    return fake(getFaker().helpers.arrayElement(this.schema._def.options))
  }
}
