import { z } from 'zod'
import { ZodSchemaFakerError } from './error'

export function assertsZodSchema(schema: unknown): asserts schema is z.ZodTypeAny {
  if (
    typeof schema !== 'object' ||
    schema === null ||
    '_parse' in schema === false ||
    typeof schema._parse !== 'function'
  ) {
    throw new ZodSchemaFakerError(`Expected a zod schema, but got ${schema}`)
  }
}
