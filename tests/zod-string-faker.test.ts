import * as z from 'zod'
import { zodStringFaker, ZodStringFaker } from '../src/zod-string-faker'
import { expectType, TypeEqual } from 'ts-expect'

test('ZodStringFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => zodStringFaker(invalidSchema)).toThrow()
})

test('ZodStringFaker should accepts a ZodString schema', () => {
  const schema = z.string()
  expect(() => zodStringFaker(schema)).not.toThrow()
})

test('zodStringFaker should return a ZodStringFaker instance', () => {
  expect(typeof zodStringFaker).toBe('function')

  const schema = z.string()
  const faker = zodStringFaker(schema)
  expect(faker instanceof ZodStringFaker).toBe(true)
})

test('ZodStringFaker.fake should be a function', () => {
  const schema = z.string()
  const faker = zodStringFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodStringFaker.fake should return string type', () => {
  const schema = z.string()
  const faker = zodStringFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, string>>(true)
})

test('ZodStringFaker.fake should return a valid data', () => {
  const schema = z.string()
  const faker = zodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('cuid', () => {
  const schema = z.string().cuid()
  const faker = zodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('email', () => {
  const schema = z.string().email()
  const faker = zodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('regex', () => {
  const schema = z.string().regex(/hello+ (world|to you)/)
  const faker = zodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('url', () => {
  const schema = z.string().url()
  const faker = zodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('uuid', () => {
  const schema = z.string().uuid()
  const faker = zodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('min', () => {
  const schema = z.string().min(100)
  const faker = zodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('max', () => {
  const schema = z.string().max(5)
  const faker = zodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})
