import { expect, test } from 'vitest'
import { z } from 'zod'
import { ZodBooleanFaker } from '../src/zod-boolean-faker'
import { expectType, TypeEqual } from 'ts-expect'

test('ZodBooleanFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => new ZodBooleanFaker(invalidSchema)).toThrow()
})

test('ZodBooleanFaker should accepts a ZodBoolean schema', () => {
  const schema = z.boolean()
  expect(() => new ZodBooleanFaker(schema)).not.toThrow()
})

test('ZodBooleanFaker should return a ZodBooleanFaker instance', () => {
  const schema = z.boolean()
  const faker = new ZodBooleanFaker(schema)
  expect(faker instanceof ZodBooleanFaker).toBe(true)
})

test('ZodBooleanFaker.fake should be a function', () => {
  const schema = z.boolean()
  const faker = new ZodBooleanFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodBooleanFaker.fake should return boolean type', () => {
  const schema = z.boolean()
  const faker = new ZodBooleanFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, boolean>>(true)
})

test('ZodBooleanFaker.fake should return a valid data', () => {
  const schema = z.boolean()
  const faker = new ZodBooleanFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})
