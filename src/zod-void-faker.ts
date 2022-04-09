import * as z from 'zod'
import { fake } from './fake'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodVoidFaker extends ZodTypeFaker<z.ZodVoid> {
  fake(): z.infer<z.ZodVoid> {
    return fake(z.any())
  }

  static create(schema: z.ZodVoid): ZodVoidFaker {
    return new ZodVoidFaker(schema)
  }
}

export const zodVoidFaker = ZodVoidFaker.create
