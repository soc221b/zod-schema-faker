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

export function lcm<T extends bigint | number>(a: T, b: T): T {
  return ((a * b) / gcd(a, b)) as T
}

export function gcd<T extends bigint | number>(a: T, b: T): T {
  return b === 0n || b === 0 ? a : gcd(b, (a % b) as T)
}
