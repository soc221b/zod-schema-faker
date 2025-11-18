import { expectType, TypeEqual } from 'ts-expect'
import { expect, test } from 'vitest'
import { z } from 'zod/v3'
import { ZodNullFaker } from '../../src/v3/zod-null-faker'

test('ZodNullFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => new ZodNullFaker(invalidSchema)).toThrow()
})

test('ZodNullFaker should accepts a ZodNull schema', () => {
  const schema = z.null()
  expect(() => new ZodNullFaker(schema)).not.toThrow()
})

test('ZodNullFaker should return a ZodNullFaker instance', () => {
  const schema = z.null()
  const faker = new ZodNullFaker(schema)
  expect(faker instanceof ZodNullFaker).toBe(true)
})

test('ZodNullFaker.fake should be a function', () => {
  const schema = z.null()
  const faker = new ZodNullFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodNullFaker.fake should return null type', () => {
  const schema = z.null()
  const faker = new ZodNullFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, null>>(true)
})

test('ZodNullFaker.fake should return a valid data', () => {
  const schema = z.null()
  const faker = new ZodNullFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})
