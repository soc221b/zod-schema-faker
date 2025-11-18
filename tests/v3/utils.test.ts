import { expect, test } from 'vitest'
import { z } from 'zod/v3'
import { assertsZodSchema } from '../../src/v3/utils'

test('assertsZodSchema should throw an error if schema is not a zod schema', () => {
  expect(() => assertsZodSchema(null)).toThrow()
  expect(() => assertsZodSchema(undefined)).toThrow()
  expect(() => assertsZodSchema(42)).toThrow()
  expect(() => assertsZodSchema('foo')).toThrow()
  expect(() => assertsZodSchema({})).toThrow()
})

test('assertsZodSchema should not throw an error if schema is a zod schema', () => {
  expect(() => assertsZodSchema(z.null())).not.toThrow()
  expect(() => assertsZodSchema(z.undefined())).not.toThrow()
  expect(() => assertsZodSchema(z.number())).not.toThrow()
  expect(() => assertsZodSchema(z.string())).not.toThrow()
  expect(() => assertsZodSchema(z.object({}))).not.toThrow()
})
