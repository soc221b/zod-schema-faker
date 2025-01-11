import { z } from 'zod'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodNeverFaker extends ZodTypeFaker<z.ZodNever> {
  fake(): z.infer<z.ZodNever> {
    throw Error()
  }
}
