export const assertZodSchema = (schema: any) => {
  if (typeof schema !== 'object' || schema === null || typeof schema._parse !== 'function') {
    throw new Error(`Expected a zod schema, but got ${schema}`)
  }
}
