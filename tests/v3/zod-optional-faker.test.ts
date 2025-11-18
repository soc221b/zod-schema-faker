import { expect, test } from 'vitest'
import { z } from 'zod/v3'
import { ZodOptionalFaker } from '../../src/v3/zod-optional-faker'
import { expectType, TypeEqual } from 'ts-expect'
import { install } from '../../src/v3'

test('ZodOptionalFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => new ZodOptionalFaker(invalidSchema)).toThrow()
})

test('ZodOptionalFaker should accepts a ZodOptional schema', () => {
  const schema = z.optional(z.string())
  expect(() => new ZodOptionalFaker(schema)).not.toThrow()
})

test('ZodOptionalFaker should return a ZodOptionalFaker instance', () => {
  const schema = z.optional(z.string())
  const faker = new ZodOptionalFaker(schema)
  expect(faker instanceof ZodOptionalFaker).toBe(true)
})

test('ZodOptionalFaker.fake should be a function', () => {
  const schema = z.optional(z.string())
  const faker = new ZodOptionalFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodOptionalFaker.fake should return optional type', () => {
  const schema = z.optional(z.string())
  const faker = new ZodOptionalFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, string | undefined>>(true)
})

test('ZodOptionalFaker.fake should return a valid data', () => {
  install()

  const schema = z.optional(z.string())
  const faker = new ZodOptionalFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})
