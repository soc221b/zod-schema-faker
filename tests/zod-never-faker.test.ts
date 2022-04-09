import * as z from 'zod'
import { zodNeverFaker, ZodNeverFaker } from '../src/zod-never-faker'
import { expectType, TypeEqual } from 'ts-expect'

test('ZodNeverFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => zodNeverFaker(invalidSchema)).toThrow()
})

test('ZodNeverFaker should accepts a ZodNever schema', () => {
  const schema = z.never()
  expect(() => zodNeverFaker(schema)).not.toThrow()
})

test('zodNeverFaker should return a ZodNeverFaker instance', () => {
  expect(typeof zodNeverFaker).toBe('function')
  const schema = z.never()
  const faker = zodNeverFaker(schema)
  expect(faker instanceof ZodNeverFaker).toBe(true)
})

test('ZodNeverFaker.fake should be a function', () => {
  const schema = z.never()
  const faker = zodNeverFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodNeverFaker.fake should return never type', () => {
  const schema = z.never()
  const faker = zodNeverFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, never>>(true)
})

test('ZodNullFaker.fake should return a data (but should not be used)', () => {
  const schema = z.never()
  const faker = zodNeverFaker(schema)
  expect(() => faker.fake()).not.toThrow()
})
