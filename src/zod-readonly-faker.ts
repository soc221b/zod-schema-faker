import * as z from 'zod'
import { fake } from './fake'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodReadonlyFaker<T extends z.ZodReadonly<z.ZodTypeAny>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    return fake(this.schema._def.innerType)
  }

  static create<T extends z.ZodReadonly<z.ZodTypeAny>>(schema: T): ZodReadonlyFaker<T> {
    return new ZodReadonlyFaker(schema)
  }
}

export const zodReadonlyFaker = ZodReadonlyFaker.create
