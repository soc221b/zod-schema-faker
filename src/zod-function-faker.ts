import * as z from 'zod'
import { fake } from './fake'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodFunctionFaker<T extends z.ZodFunction<any, any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    return (..._: Parameters<z.infer<T>>) => {
      return fake(this.schema._def.returns)
    }
  }

  static create<T extends z.ZodFunction<any, any>>(schema: T): ZodFunctionFaker<T> {
    return new ZodFunctionFaker(schema)
  }
}

export const zodFunctionFaker: typeof ZodFunctionFaker.create = ZodFunctionFaker.create
