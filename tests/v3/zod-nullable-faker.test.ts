import { expect, test } from 'vitest'
import { z } from 'zod/v3'
import { ZodNullableFaker } from '../../src/v3/zod-nullable-faker'
import { expectType, TypeEqual } from 'ts-expect'
import { install } from '../../src/v3'

test('ZodNullableFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => new ZodNullableFaker(invalidSchema)).toThrow()
})

test('ZodNullableFaker should accepts a ZodNullable schema', () => {
  const schema = z.nullable(z.string())
  expect(() => new ZodNullableFaker(schema)).not.toThrow()
})

test('ZodNullableFaker should return a ZodNullableFaker instance', () => {
  const schema = z.nullable(z.string())
  const faker = new ZodNullableFaker(schema)
  expect(faker instanceof ZodNullableFaker).toBe(true)
})

test('ZodNullableFaker.fake should be a function', () => {
  const schema = z.nullable(z.string())
  const faker = new ZodNullableFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodNullableFaker.fake should return nullable type', () => {
  const schema = z.nullable(z.string())
  const faker = new ZodNullableFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, string | null>>(true)
})

test('ZodNullableFaker.fake should return a valid data', () => {
  install()

  const schema = z.nullable(z.string())
  const faker = new ZodNullableFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})
