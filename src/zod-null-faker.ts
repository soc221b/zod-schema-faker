import { z } from 'zod'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodNullFaker extends ZodTypeFaker<z.ZodNull> {
  fake(): z.infer<z.ZodNull> {
    return null
  }
}
