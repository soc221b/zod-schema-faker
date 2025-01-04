import { z } from 'zod'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodNeverFaker extends ZodTypeFaker<z.ZodNever> {
  fake(): z.infer<z.ZodNever> {
    throw Error()
  }

  static create(schema: z.ZodNever): ZodNeverFaker {
    return new ZodNeverFaker(schema)
  }
}

export const zodNeverFaker: typeof ZodNeverFaker.create = ZodNeverFaker.create
