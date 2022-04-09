import * as z from 'zod'
import { assertZodSchema } from './utils'

export const zodTypeKindToZodTypeFaker: Map<z.ZodFirstPartyTypeKind, any /* TODO: should not use any */> = new Map()

/**
 * generate fake data based on schema
 */
export const fake = <T extends z.ZodType>(schema: T): z.infer<T> => {
  assertZodSchema(schema)

  const typeName = (schema._def as any).typeName
  const faker = zodTypeKindToZodTypeFaker.get(typeName)
  if (faker === undefined) {
    throw ReferenceError(`Unsupported schema: ${typeName}`)
  }

  return faker.create(schema).fake()
}
