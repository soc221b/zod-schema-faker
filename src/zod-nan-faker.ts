import { z } from 'zod'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodNaNFaker extends ZodTypeFaker<z.ZodNaN> {
  fake(): z.infer<z.ZodNaN> {
    return NaN
  }
}
