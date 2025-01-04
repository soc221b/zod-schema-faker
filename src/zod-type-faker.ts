import { z } from 'zod'
import { assertsZodSchema } from './utils'

export abstract class ZodTypeFaker<T extends z.ZodTypeAny> {
  constructor(protected schema: T) {
    assertsZodSchema(schema)
  }

  abstract fake(): z.infer<T>
}
