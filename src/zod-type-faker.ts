import * as z from 'zod'
import { assertZodSchema } from './utils'

export abstract class ZodTypeFaker<T extends z.ZodType<any, any, any>> {
  protected schema: T

  constructor(schema: T) {
    assertZodSchema(schema)

    this.schema = schema
  }

  abstract fake(): z.infer<T>
}
