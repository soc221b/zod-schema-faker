import * as z from 'zod'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodUnknownFaker extends ZodTypeFaker<z.ZodUnknown> {
  fake(): z.infer<z.ZodUnknown> {
    return void 0
  }

  static create(schema: z.ZodUnknown): ZodUnknownFaker {
    return new ZodUnknownFaker(schema)
  }
}

export const zodUnknownFaker = ZodUnknownFaker.create
