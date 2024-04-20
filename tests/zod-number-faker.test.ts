import * as z from 'zod'
import { zodNumberFaker, ZodNumberFaker } from '../src/zod-number-faker'
import { expectType, TypeEqual } from 'ts-expect'
import { testMultipleTimes } from './util'

test('ZodNumberFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => zodNumberFaker(invalidSchema)).toThrow()
})

test('ZodNumberFaker should accepts a ZodNumber schema', () => {
  const schema = z.number()
  expect(() => zodNumberFaker(schema)).not.toThrow()
})

test('zodNumberFaker should return a ZodNumberFaker instance', () => {
  expect(typeof zodNumberFaker).toBe('function')

  const schema = z.number()
  const faker = zodNumberFaker(schema)
  expect(faker instanceof ZodNumberFaker).toBe(true)
})

test('ZodNumberFaker.fake should be a function', () => {
  const schema = z.number()
  const faker = zodNumberFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodNumberFaker.fake should return number type', () => {
  const schema = z.number()
  const faker = zodNumberFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, number>>(true)
})

test('ZodNumberFaker.fake should return a valid data', () => {
  const schema = z.number()
  const faker = zodNumberFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

testMultipleTimes('gt', () => {
  const schema = z.number().gt(1e9)
  const faker = zodNumberFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

testMultipleTimes('gte', () => {
  const schema = z.number().gte(1e9)
  const faker = zodNumberFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

testMultipleTimes('min', () => {
  const schema = z.number().min(1e9)
  const faker = zodNumberFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

testMultipleTimes('lt', () => {
  const schema = z.number().gt(-1e9)
  const faker = zodNumberFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

testMultipleTimes('lte', () => {
  const schema = z.number().gte(-1e9)
  const faker = zodNumberFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

testMultipleTimes('max', () => {
  const schema = z.number().max(-1e9)
  const faker = zodNumberFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

testMultipleTimes('int', () => {
  const schema = z.number().int()
  const faker = zodNumberFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

testMultipleTimes('positive', () => {
  const schema = z.number().positive()
  const faker = zodNumberFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

testMultipleTimes('non-positive', () => {
  const schema = z.number().nonpositive()
  const faker = zodNumberFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

testMultipleTimes('negative', () => {
  const schema = z.number().negative()
  const faker = zodNumberFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

testMultipleTimes('non-negative', () => {
  const schema = z.number().nonnegative()
  const faker = zodNumberFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

// TODO
testMultipleTimes.skip('multipleOf', () => {
  const schema = z.number().multipleOf(5)
  const faker = zodNumberFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

testMultipleTimes('finite', () => {
  const schema = z.number().finite()
  const faker = zodNumberFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

testMultipleTimes('safe', () => {
  const schema = z.number().safe()
  const faker = zodNumberFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})
