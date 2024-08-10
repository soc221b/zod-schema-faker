import * as z from 'zod'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodLiteralFaker<T extends z.ZodLiteral<any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    return this.schema._def.value
  }

  static create<T extends z.ZodLiteral<any>>(schema: T): ZodLiteralFaker<T> {
    return new ZodLiteralFaker(schema)
  }
}

export const zodLiteralFaker: typeof ZodLiteralFaker.create = ZodLiteralFaker.create
