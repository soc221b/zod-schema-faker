import { z } from 'zod'
import { runFake } from './random'
import { ZodTypeFaker } from './zod-type-faker'
import { fake } from './fake'
import { zodNeverFaker } from './zod-never-faker'

export class ZodCatchFaker<T extends z.ZodCatch<z.ZodTypeAny>> extends ZodTypeFaker<T> {
  fake(): z.infer<z.ZodCatch<T>> {
    return runFake(faker => faker.datatype.boolean())
      ? this.schema.parse(zodNeverFaker(z.never()))
      : fake(this.schema._def.innerType)
  }

  static create<T extends z.ZodCatch<z.ZodTypeAny>>(schema: T): ZodCatchFaker<T> {
    return new ZodCatchFaker(schema)
  }
}

export const zodCatchFaker: typeof ZodCatchFaker.create = ZodCatchFaker.create
