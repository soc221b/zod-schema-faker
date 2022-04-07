import * as z from 'zod'
import { zodSetFaker, ZodSetFaker } from '../src/zod-set-faker'
import { expectType, TypeEqual } from 'ts-expect'
import { install } from '../src'

test('ZodSetFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => zodSetFaker(invalidSchema)).toThrow()
})

test('ZodSetFaker should accepts a ZodSet schema', () => {
  const schema = z.set(z.number())
  expect(() => zodSetFaker(schema)).not.toThrow()
})

test('zodSetFaker should return a ZodSetFaker instance', () => {
  expect(typeof zodSetFaker).toBe('function')

  const schema = z.set(z.number())
  const faker = zodSetFaker(schema)
  expect(faker instanceof ZodSetFaker).toBe(true)
})

test('ZodSetFaker.fake should be a function', () => {
  const schema = z.set(z.number())
  const faker = zodSetFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodSetFaker.fake should return set type', () => {
  const schema = z.set(z.number())
  const faker = zodSetFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, Set<number>>>(true)
})

test('ZodSetFaker.fake should return a valid data', () => {
  install()

  const schema = z.set(z.number())
  const faker = zodSetFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('non-empty', () => {
  install()

  const schema = z.set(z.number()).nonempty()
  const faker = zodSetFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('min', () => {
  install()

  const schema = z.set(z.number()).min(5)
  const faker = zodSetFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('max', () => {
  install()

  const schema = z.set(z.number()).max(5)
  const faker = zodSetFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('size', () => {
  install()

  const schema = z.set(z.number()).size(5)
  const faker = zodSetFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})
