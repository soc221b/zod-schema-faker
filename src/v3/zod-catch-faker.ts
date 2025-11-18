import { z } from 'zod/v3'
import { fake } from './fake'
import { getFaker } from './random'
import { ZodNeverFaker } from './zod-never-faker'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodCatchFaker<T extends z.ZodCatch<z.ZodTypeAny>> extends ZodTypeFaker<T> {
  fake(): z.infer<z.ZodCatch<T>> {
    if (getFaker().datatype.boolean()) {
      return this.schema.parse(new ZodNeverFaker(z.never()))
    } else {
      return fake(this.schema._def.innerType)
    }
  }
}
