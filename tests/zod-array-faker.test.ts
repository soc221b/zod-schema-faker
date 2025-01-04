import { expect, test } from 'vitest'
import { z } from 'zod'
import { zodArrayFaker, ZodArrayFaker } from '../src/zod-array-faker'
import { expectType, TypeEqual } from 'ts-expect'
import { install } from '../src'

test('ZodArrayFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => zodArrayFaker(invalidSchema)).toThrow()
})

test('ZodArrayFaker should accepts a ZodArray schema', () => {
  const schema = z.array(z.number())
  expect(() => zodArrayFaker(schema)).not.toThrow()
})

test('ZodArrayFaker should return a ZodArrayFaker instance', () => {
  expect(typeof zodArrayFaker).toBe('function')
  const schema = z.array(z.number())
  const faker = zodArrayFaker(schema)
  expect(faker instanceof ZodArrayFaker).toBe(true)
})

test('ZodArrayFaker.fake should be a function', () => {
  const schema = z.array(z.number())
  const faker = zodArrayFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodArrayFaker.fake should return array type', () => {
  const schema = z.array(z.number())
  const faker = zodArrayFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, number[]>>(true)
})

test('ZodArrayFaker.fake should return a valid data', () => {
  install()

  const schema = z.array(z.number())
  const faker = zodArrayFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('non-empty', () => {
  install()

  const schema = z.array(z.number()).nonempty()
  const faker = zodArrayFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('min', () => {
  install()

  const schema = z.array(z.number()).min(5)
  const faker = zodArrayFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('max', () => {
  install()

  const schema = z.array(z.number()).max(5)
  const faker = zodArrayFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('length', () => {
  install()

  const schema = z.array(z.number()).length(5)
  const faker = zodArrayFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})
