import * as z from 'zod'
import { fake } from './fake'
import { runFake } from './faker'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodOptionalFaker<T extends z.ZodOptional<any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    return runFake(faker => faker.datatype.boolean()) ? undefined : fake(this.schema._def.innerType)
  }

  static create<T extends z.ZodOptional<any>>(schema: T): ZodOptionalFaker<T> {
    return new ZodOptionalFaker(schema)
  }
}

export const zodOptionalFaker: <T extends z.ZodOptional<any>>(schema: T) => ZodOptionalFaker<T> =
  ZodOptionalFaker.create
