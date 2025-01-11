import { z } from 'zod'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodLiteralFaker<T extends z.ZodLiteral<any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    return this.schema._def.value
  }
}
