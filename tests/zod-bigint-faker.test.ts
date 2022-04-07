import * as z from 'zod'
import { zodBigIntFaker, ZodBigIntFaker } from '../src/zod-bigint-faker'
import { expectType, TypeEqual } from 'ts-expect'

test('ZodBigIntFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => zodBigIntFaker(invalidSchema)).toThrow()
})

test('ZodBigIntFaker should accepts a ZodBigInt schema', () => {
  const schema = z.bigint()
  expect(() => zodBigIntFaker(schema)).not.toThrow()
})

test('zodBigIntFaker should return a ZodBigIntFaker instance', () => {
  expect(typeof zodBigIntFaker).toBe('function')
  const schema = z.bigint()
  const faker = zodBigIntFaker(schema)
  expect(faker instanceof ZodBigIntFaker).toBe(true)
})

test('ZodBigIntFaker.fake should be a function', () => {
  const schema = z.bigint()
  const faker = zodBigIntFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodBigIntFaker.fake should return bigint type', () => {
  const schema = z.bigint()
  const faker = zodBigIntFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, bigint>>(true)
})

test('ZodBigIntFaker.fake should return a valid data', () => {
  const schema = z.bigint()
  const faker = zodBigIntFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})
