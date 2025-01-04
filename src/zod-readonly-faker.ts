import { z } from 'zod'
import { fake } from './fake'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodReadonlyFaker<T extends z.ZodReadonly<z.ZodTypeAny>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    return Object.freeze(fake(this.schema._def.innerType))
  }
}
