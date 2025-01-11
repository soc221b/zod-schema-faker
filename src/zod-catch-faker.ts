import { z } from 'zod'
import { runFake } from './random'
import { ZodTypeFaker } from './zod-type-faker'
import { fake } from './fake'
import { ZodNeverFaker } from './zod-never-faker'

export class ZodCatchFaker<T extends z.ZodCatch<z.ZodTypeAny>> extends ZodTypeFaker<T> {
  fake(): z.infer<z.ZodCatch<T>> {
    if (runFake(faker => faker.datatype.boolean())) {
      return this.schema.parse(new ZodNeverFaker(z.never()))
    } else {
      return fake(this.schema._def.innerType)
    }
  }
}
