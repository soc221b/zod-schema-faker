import { z } from 'zod'
import { fake } from './fake'
import { getFaker } from './random'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodOptionalFaker<T extends z.ZodOptional<any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    if (getFaker().datatype.boolean()) {
      return undefined
    } else {
      return fake(this.schema._def.innerType)
    }
  }
}
