import { expect, test } from 'vitest'
import { z } from 'zod/v3'
import { ZodLiteralFaker } from '../../src/v3/zod-literal-faker'
import { expectType, TypeEqual } from 'ts-expect'

test('ZodLiteralFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => new ZodLiteralFaker(invalidSchema)).toThrow()
})

test('ZodLiteralFaker should accepts a ZodLiteral schema', () => {
  const schema = z.literal('foo')
  expect(() => new ZodLiteralFaker(schema)).not.toThrow()
})

test('ZodLiteralFaker should return a ZodLiteralFaker instance', () => {
  const schema = z.literal('foo')
  const faker = new ZodLiteralFaker(schema)
  expect(faker instanceof ZodLiteralFaker).toBe(true)
})

test('ZodLiteralFaker.fake should be a function', () => {
  const schema = z.literal('foo')
  const faker = new ZodLiteralFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodLiteralFaker.fake should return the given type', () => {
  const schema = z.literal('foo')
  const faker = new ZodLiteralFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, 'foo'>>(true)
})

test('ZodLiteralFaker.fake should return a valid data', () => {
  const schema = z.literal('foo')
  const faker = new ZodLiteralFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})
