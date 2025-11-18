import { z } from 'zod/v3'
import { fake } from './fake'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodUnknownFaker extends ZodTypeFaker<z.ZodUnknown> {
  fake(): z.infer<z.ZodUnknown> {
    return fake(z.any())
  }
}
