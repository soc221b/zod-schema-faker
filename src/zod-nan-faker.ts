import { z } from 'zod'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodNaNFaker extends ZodTypeFaker<z.ZodNaN> {
  fake(): z.infer<z.ZodNaN> {
    return NaN
  }

  static create(schema: z.ZodNaN): ZodNaNFaker {
    return new ZodNaNFaker(schema)
  }
}

export const zodNaNFaker: typeof ZodNaNFaker.create = ZodNaNFaker.create
