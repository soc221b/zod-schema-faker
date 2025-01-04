import { z } from 'zod'
import { fake } from './fake'
import { runFake } from './random'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodNullableFaker<T extends z.ZodNullable<any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    return runFake(faker => faker.datatype.boolean()) ? null : fake(this.schema._def.innerType)
  }

  static create<T extends z.ZodNullable<any>>(schema: T): ZodNullableFaker<T> {
    return new ZodNullableFaker(schema)
  }
}

export const zodNullableFaker: typeof ZodNullableFaker.create = ZodNullableFaker.create
