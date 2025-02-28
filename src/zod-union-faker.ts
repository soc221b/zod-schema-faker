import { z } from 'zod'
import { ZodTypeFaker } from './zod-type-faker'
import { fake } from './fake'
import { getFaker } from './random'

export class ZodUnionFaker<T extends z.ZodUnion<any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    return fake(getFaker().helpers.arrayElement(this.schema._def.options))
  }
}
