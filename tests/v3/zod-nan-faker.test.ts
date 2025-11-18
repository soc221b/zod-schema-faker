import { expectType, TypeEqual } from 'ts-expect'
import { expect, test } from 'vitest'
import { z } from 'zod/v3'
import { ZodNaNFaker } from '../../src/v3/zod-nan-faker'

test('ZodNaNFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => new ZodNaNFaker(invalidSchema)).toThrow()
})

test('ZodNaNFaker should accepts a ZodNaN schema', () => {
  const schema = z.nan()
  expect(() => new ZodNaNFaker(schema)).not.toThrow()
})

test('ZodNaNFaker should return a ZodNaNFaker instance', () => {
  const schema = z.nan()
  const faker = new ZodNaNFaker(schema)
  expect(faker instanceof ZodNaNFaker).toBe(true)
})

test('ZodNaNFaker.fake should be a function', () => {
  const schema = z.nan()
  const faker = new ZodNaNFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodNaNFaker.fake should return number type', () => {
  const schema = z.nan()
  const faker = new ZodNaNFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, number>>(true)
})

test('ZodNaNFaker.fake should return a valid data', () => {
  const schema = z.nan()
  const faker = new ZodNaNFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})
