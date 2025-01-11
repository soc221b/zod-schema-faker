import { expect, test } from 'vitest'
import { z } from 'zod'
import { ZodUndefinedFaker } from '../src/zod-undefined-faker'
import { expectType, TypeEqual } from 'ts-expect'

test('ZodUndefinedFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => new ZodUndefinedFaker(invalidSchema)).toThrow()
})

test('ZodUndefinedFaker should accepts a ZodUndefined schema', () => {
  const schema = z.undefined()
  expect(() => new ZodUndefinedFaker(schema)).not.toThrow()
})

test('ZodUndefinedFaker should return a ZodUndefinedFaker instance', () => {
  const schema = z.undefined()
  const faker = new ZodUndefinedFaker(schema)
  expect(faker instanceof ZodUndefinedFaker).toBe(true)
})

test('ZodUndefinedFaker.fake should be a function', () => {
  const schema = z.undefined()
  const faker = new ZodUndefinedFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodUndefinedFaker.fake should return undefined type', () => {
  const schema = z.undefined()
  const faker = new ZodUndefinedFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, undefined>>(true)
})

test('ZodUndefinedFaker.fake should return a valid data', () => {
  const schema = z.undefined()
  const faker = new ZodUndefinedFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})
