import * as z from 'zod'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodAnyFaker extends ZodTypeFaker<z.ZodAny> {
  fake(): z.infer<z.ZodAny> {}

  static create(schema: z.ZodAny): ZodAnyFaker {
    return new ZodAnyFaker(schema)
  }
}

export const zodAnyFaker = ZodAnyFaker.create
