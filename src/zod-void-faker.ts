import { z } from 'zod'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodVoidFaker extends ZodTypeFaker<z.ZodVoid> {
  fake(): z.infer<z.ZodVoid> {
    return undefined
  }
}
