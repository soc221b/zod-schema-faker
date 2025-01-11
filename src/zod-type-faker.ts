import { z } from 'zod'
import { assertsZodSchema } from './utils'

export abstract class ZodTypeFaker<T extends z.ZodTypeAny> {
  constructor(protected schema: T) {
    assertsZodSchema(schema)
  }

  abstract fake(): z.infer<T>
}

export class ZodTypeFakerConcrete<T extends z.ZodTypeAny> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    throw new Error('Method not implemented.')
  }
}
