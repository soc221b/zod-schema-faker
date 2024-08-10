import { ZodSchemaFakerError } from './error'

export const assertZodSchema = (schema: any): void | never => {
  if (typeof schema !== 'object' || schema === null || typeof schema._parse !== 'function') {
    throw new ZodSchemaFakerError(`Expected a zod schema, but got ${schema}`)
  }
}
