import { z } from 'zod/v3'
import { fake } from './fake'
import { getFaker } from './random'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodDefaultFaker<T extends z.ZodDefault<any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    if (getFaker().datatype.boolean()) {
      return this.schema._def.defaultValue()
    } else {
      return fake(this.schema._def.innerType)
    }
  }
}
