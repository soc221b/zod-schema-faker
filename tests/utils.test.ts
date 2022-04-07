import { assertZodSchema } from '../src/utils'
import * as z from 'zod'

test('assertZodSchema should throw an error if schema is not a zod schema', () => {
  expect(() => assertZodSchema(null)).toThrow()
  expect(() => assertZodSchema(undefined)).toThrow()
  expect(() => assertZodSchema(42)).toThrow()
  expect(() => assertZodSchema('foo')).toThrow()
  expect(() => assertZodSchema({})).toThrow()
})

test('assertZodSchema should not throw an error if schema is a zod schema', () => {
  expect(() => assertZodSchema(z.null())).not.toThrow()
  expect(() => assertZodSchema(z.undefined())).not.toThrow()
  expect(() => assertZodSchema(z.number())).not.toThrow()
  expect(() => assertZodSchema(z.string())).not.toThrow()
  expect(() => assertZodSchema(z.object({}))).not.toThrow()
})
