import { z } from 'zod'
import { ZodSchemaFakerError } from './error'
import { assertsZodSchema } from './utils'

export const zodTypeKindToZodTypeFaker: Map<z.ZodFirstPartyTypeKind, any /* TODO: should not use any */> = new Map()
export const zodTypeToZodTypeFaker: Map<z.ZodType, any /* TODO: should not use any */> = new Map()

/**
 * generate fake data based on schema
 */
export const fake = <T extends z.ZodType>(schema: T): z.infer<T> => {
  assertsZodSchema(schema)

  const typeName = (schema._def as any).typeName
  const faker = zodTypeToZodTypeFaker.get(schema) ?? zodTypeKindToZodTypeFaker.get(typeName)
  if (faker === undefined) {
    throw new ZodSchemaFakerError(`Unsupported schema type: ${typeName}.
- If this is a custom schema, you may not have installed a corresponding faker. If you need help with installation, please refer to the documentation for more information.
- If this is a built-in schema, it may not be implemented yet. Please file an issue to let us know: https://github.com/soc221b/zod-schema-faker/issues`)
  }

  return new faker(schema).fake()
}
