import * as z from 'zod'
import { zodLiteralFaker, ZodLiteralFaker } from '../src/zod-literal-faker'
import { expectType, TypeEqual } from 'ts-expect'

test('ZodLiteralFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => zodLiteralFaker(invalidSchema)).toThrow()
})

test('ZodLiteralFaker should accepts a ZodLiteral schema', () => {
  const schema = z.literal('foo')
  expect(() => zodLiteralFaker(schema)).not.toThrow()
})

test('ZodLiteralFaker should return a ZodLiteralFaker instance', () => {
  expect(typeof zodLiteralFaker).toBe('function')

  const schema = z.literal('foo')
  const faker = zodLiteralFaker(schema)
  expect(faker instanceof ZodLiteralFaker).toBe(true)
})

test('ZodLiteralFaker.fake should be a function', () => {
  const schema = z.literal('foo')
  const faker = zodLiteralFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodLiteralFaker.fake should return the given type', () => {
  const schema = z.literal('foo')
  const faker = zodLiteralFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, 'foo'>>(true)
})

test('ZodLiteralFaker.fake should return a valid data', () => {
  const schema = z.literal('foo')
  const faker = zodLiteralFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})
