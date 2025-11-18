import { z } from 'zod/v3'
import { ZodSchemaFakerError } from './error'
import { ZodTypeFakerConcrete } from './zod-type-faker'

export const zodFirstPartyTypeKindToZodTypeFaker: Map<
  z.ZodFirstPartyTypeKind,
  typeof ZodTypeFakerConcrete<z.ZodTypeAny>
> = new Map()
export const zodTypeToZodTypeFaker: Map<z.ZodType, typeof ZodTypeFakerConcrete<z.ZodTypeAny>> = new Map()

/**
 * Generate fake data based on schema.
 *
 * @throws when a corresponding faker is not registered.
 */
export const fake = <T extends z.ZodType>(schema: T): z.infer<T> => {
  const typeName = (schema._def as any).typeName
  const Faker = zodTypeToZodTypeFaker.get(schema) ?? zodFirstPartyTypeKindToZodTypeFaker.get(typeName)
  if (Faker === undefined) {
    throw new ZodSchemaFakerError(`Unsupported schema type: ${typeName}.
- If this is a custom schema, you may not have installed a corresponding faker. If you need help with installation, please refer to the documentation for more information.
- If this is a built-in schema, it may not be implemented yet. Please file an issue to let us know: https://github.com/soc221b/zod-schema-faker/issues`)
  }

  return new Faker(schema).fake()
}
