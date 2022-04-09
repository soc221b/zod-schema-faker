import * as z from 'zod'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodNeverFaker extends ZodTypeFaker<z.ZodNever> {
  fake(): z.infer<z.ZodNever> {
    return void 0 as never
  }

  static create(schema: z.ZodNever): ZodNeverFaker {
    return new ZodNeverFaker(schema)
  }
}

export const zodNeverFaker = ZodNeverFaker.create
