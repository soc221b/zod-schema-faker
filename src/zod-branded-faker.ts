import { z } from 'zod'
import { fake } from './fake'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodBrandedFaker<T extends z.ZodBranded<any, any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    return fake(this.schema._def.type)
  }
}
