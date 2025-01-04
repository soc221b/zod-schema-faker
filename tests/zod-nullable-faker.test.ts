import { expect, test } from 'vitest'
import { z } from 'zod'
import { zodNullableFaker, ZodNullableFaker } from '../src/zod-nullable-faker'
import { expectType, TypeEqual } from 'ts-expect'
import { install } from '../src'

test('ZodNullableFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => zodNullableFaker(invalidSchema)).toThrow()
})

test('ZodNullableFaker should accepts a ZodNullable schema', () => {
  const schema = z.nullable(z.string())
  expect(() => zodNullableFaker(schema)).not.toThrow()
})

test('ZodNullableFaker should return a ZodNullableFaker instance', () => {
  expect(typeof zodNullableFaker).toBe('function')

  const schema = z.nullable(z.string())
  const faker = zodNullableFaker(schema)
  expect(faker instanceof ZodNullableFaker).toBe(true)
})

test('ZodNullableFaker.fake should be a function', () => {
  const schema = z.nullable(z.string())
  const faker = zodNullableFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodNullableFaker.fake should return nullable type', () => {
  const schema = z.nullable(z.string())
  const faker = zodNullableFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, string | null>>(true)
})

test('ZodNullableFaker.fake should return a valid data', () => {
  install()

  const schema = z.nullable(z.string())
  const faker = zodNullableFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})
