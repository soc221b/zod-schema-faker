import * as z from 'zod'
import { zodAnyFaker, ZodAnyFaker } from '../src/zod-any-faker'
import { expectType, TypeEqual } from 'ts-expect'
import { install } from '../src'

test('ZodAnyFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => zodAnyFaker(invalidSchema)).toThrow()
})

test('ZodAnyFaker should accepts a ZodAny schema', () => {
  const schema = z.any()
  expect(() => zodAnyFaker(schema)).not.toThrow()
})

test('ZodAnyFaker should return a ZodAnyFaker instance', () => {
  expect(typeof zodAnyFaker).toBe('function')

  const schema = z.any()
  const faker = zodAnyFaker(schema)
  expect(faker instanceof ZodAnyFaker).toBe(true)
})

test('ZodAnyFaker.fake should be a function', () => {
  const schema = z.any()
  const faker = zodAnyFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodAnyFaker.fake should return any type', () => {
  const schema = z.any()
  const faker = zodAnyFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, any>>(true)
})

test('ZodAnyFaker.fake should return a valid data', () => {
  install()
  const schema = z.any()
  const faker = zodAnyFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})
