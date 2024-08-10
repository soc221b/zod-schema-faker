import * as z from 'zod'
import { fake } from './fake'
import { runFake } from './faker'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodDefaultFaker<T extends z.ZodDefault<any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    return runFake(faker => faker.datatype.boolean())
      ? this.schema._def.defaultValue()
      : fake(this.schema._def.innerType)
  }

  static create<T extends z.ZodDefault<any>>(schema: T): ZodDefaultFaker<T> {
    return new ZodDefaultFaker(schema)
  }
}

export const zodDefaultFaker: typeof ZodDefaultFaker.create = ZodDefaultFaker.create
