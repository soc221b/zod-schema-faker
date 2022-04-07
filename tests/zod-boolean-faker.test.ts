import * as z from 'zod'
import { zodBooleanFaker, ZodBooleanFaker } from '../src/zod-boolean-faker'
import { expectType, TypeEqual } from 'ts-expect'

test('ZodBooleanFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => zodBooleanFaker(invalidSchema)).toThrow()
})

test('ZodBooleanFaker should accepts a ZodBoolean schema', () => {
  const schema = z.boolean()
  expect(() => zodBooleanFaker(schema)).not.toThrow()
})

test('zodBooleanFaker should return a ZodBooleanFaker instance', () => {
  expect(typeof zodBooleanFaker).toBe('function')

  const schema = z.boolean()
  const faker = zodBooleanFaker(schema)
  expect(faker instanceof ZodBooleanFaker).toBe(true)
})

test('ZodBooleanFaker.fake should be a function', () => {
  const schema = z.boolean()
  const faker = zodBooleanFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodBooleanFaker.fake should return boolean type', () => {
  const schema = z.boolean()
  const faker = zodBooleanFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, boolean>>(true)
})

test('ZodBooleanFaker.fake should return a valid data', () => {
  const schema = z.boolean()
  const faker = zodBooleanFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})
