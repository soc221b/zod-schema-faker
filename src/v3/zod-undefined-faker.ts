import { z } from 'zod/v3'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodUndefinedFaker extends ZodTypeFaker<z.ZodUndefined> {
  fake(): z.infer<z.ZodUndefined> {
    return void 0
  }
}
