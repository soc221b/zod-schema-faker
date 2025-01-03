import { expect, test } from 'vitest'
import * as z from 'zod'
import { zodOptionalFaker, ZodOptionalFaker } from '../src/zod-optional-faker'
import { expectType, TypeEqual } from 'ts-expect'
import { install } from '../src'

test('ZodOptionalFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => zodOptionalFaker(invalidSchema)).toThrow()
})

test('ZodOptionalFaker should accepts a ZodOptional schema', () => {
  const schema = z.optional(z.string())
  expect(() => zodOptionalFaker(schema)).not.toThrow()
})

test('ZodOptionalFaker should return a ZodOptionalFaker instance', () => {
  expect(typeof zodOptionalFaker).toBe('function')

  const schema = z.optional(z.string())
  const faker = zodOptionalFaker(schema)
  expect(faker instanceof ZodOptionalFaker).toBe(true)
})

test('ZodOptionalFaker.fake should be a function', () => {
  const schema = z.optional(z.string())
  const faker = zodOptionalFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodOptionalFaker.fake should return optional type', () => {
  const schema = z.optional(z.string())
  const faker = zodOptionalFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, string | undefined>>(true)
})

test('ZodOptionalFaker.fake should return a valid data', () => {
  install()

  const schema = z.optional(z.string())
  const faker = zodOptionalFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})
