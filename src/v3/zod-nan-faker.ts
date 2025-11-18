import { z } from 'zod/v3'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodNaNFaker extends ZodTypeFaker<z.ZodNaN> {
  fake(): z.infer<z.ZodNaN> {
    return NaN
  }
}
