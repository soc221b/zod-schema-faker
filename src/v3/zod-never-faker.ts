import { z } from 'zod/v3'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodNeverFaker extends ZodTypeFaker<z.ZodNever> {
  fake(): z.infer<z.ZodNever> {
    throw Error()
  }
}
