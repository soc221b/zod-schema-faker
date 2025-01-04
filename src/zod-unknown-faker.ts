import { z } from 'zod'
import { ZodTypeFaker } from './zod-type-faker'
import { fake } from './fake'

export class ZodUnknownFaker extends ZodTypeFaker<z.ZodUnknown> {
  fake(): z.infer<z.ZodUnknown> {
    return fake(z.any())
  }

  static create(schema: z.ZodUnknown): ZodUnknownFaker {
    return new ZodUnknownFaker(schema)
  }
}

export const zodUnknownFaker: typeof ZodUnknownFaker.create = ZodUnknownFaker.create
