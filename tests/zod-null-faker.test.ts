import { expect, test } from 'vitest'
import * as z from 'zod'
import { zodNullFaker, ZodNullFaker } from '../src/zod-null-faker'
import { expectType, TypeEqual } from 'ts-expect'

test('ZodNullFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => zodNullFaker(invalidSchema)).toThrow()
})

test('ZodNullFaker should accepts a ZodNull schema', () => {
  const schema = z.null()
  expect(() => zodNullFaker(schema)).not.toThrow()
})

test('ZodNullFaker should return a ZodNullFaker instance', () => {
  expect(typeof zodNullFaker).toBe('function')

  const schema = z.null()
  const faker = zodNullFaker(schema)
  expect(faker instanceof ZodNullFaker).toBe(true)
})

test('ZodNullFaker.fake should be a function', () => {
  const schema = z.null()
  const faker = zodNullFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodNullFaker.fake should return null type', () => {
  const schema = z.null()
  const faker = zodNullFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, null>>(true)
})

test('ZodNullFaker.fake should return a valid data', () => {
  const schema = z.null()
  const faker = zodNullFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})
