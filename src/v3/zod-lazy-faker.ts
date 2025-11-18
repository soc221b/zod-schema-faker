import { z } from 'zod/v3'
import { fake } from './fake'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodLazyFaker<T extends z.ZodTypeAny> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    return fake(this.schema._def.getter())
  }
}
