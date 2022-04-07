import * as z from 'zod'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodDateFaker extends ZodTypeFaker<z.ZodDate> {
  fake(): z.infer<z.ZodDate> {
    return new Date()
  }

  static create(schema: z.ZodDate): ZodDateFaker {
    return new ZodDateFaker(schema)
  }
}

export const zodDateFaker = ZodDateFaker.create
