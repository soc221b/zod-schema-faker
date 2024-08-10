import * as z from 'zod'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodUndefinedFaker extends ZodTypeFaker<z.ZodUndefined> {
  fake(): z.infer<z.ZodUndefined> {
    return void 0
  }

  static create(schema: z.ZodUndefined): ZodUndefinedFaker {
    return new ZodUndefinedFaker(schema)
  }
}

export const zodUndefinedFaker: typeof ZodUndefinedFaker.create = ZodUndefinedFaker.create
