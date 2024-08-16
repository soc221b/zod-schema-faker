import * as z from 'zod'
import { zodNaNFaker, ZodNaNFaker } from '../src/zod-nan-faker'
import { expectType, TypeEqual } from 'ts-expect'

test('ZodNaNFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => zodNaNFaker(invalidSchema)).toThrow()
})

test('ZodNaNFaker should accepts a ZodNaN schema', () => {
  const schema = z.nan()
  expect(() => zodNaNFaker(schema)).not.toThrow()
})

test('ZodNaNFaker should return a ZodNaNFaker instance', () => {
  expect(typeof zodNaNFaker).toBe('function')

  const schema = z.nan()
  const faker = zodNaNFaker(schema)
  expect(faker instanceof ZodNaNFaker).toBe(true)
})

test('ZodNaNFaker.fake should be a function', () => {
  const schema = z.nan()
  const faker = zodNaNFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodNaNFaker.fake should return number type', () => {
  const schema = z.nan()
  const faker = zodNaNFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, number>>(true)
})

test('ZodNaNFaker.fake should return NaN', () => {
  const schema = z.nan()
  const faker = zodNaNFaker(schema)
  const data = faker.fake()
  expect(data).toBe(NaN)
})

test('ZodNaNFaker.fake should return a valid data', () => {
  const schema = z.nan()
  const faker = zodNaNFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})
