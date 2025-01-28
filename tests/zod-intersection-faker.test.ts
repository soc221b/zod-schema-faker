import { describe, expect, test } from 'vitest'
import { z } from 'zod'
import { ZodIntersectionFaker } from '../src/zod-intersection-faker'
import { expectType, TypeEqual } from 'ts-expect'
import { install } from '../src'
import { testMultipleTimes } from './util'

const Person = z.object({
  name: z.string(),
})
const Employee = z.object({
  role: z.string(),
})

test('ZodIntersectionFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => new ZodIntersectionFaker(invalidSchema)).toThrow()
})

test('ZodIntersectionFaker should accepts a ZodIntersection schema', () => {
  const schema = z.intersection(Person, Employee)
  expect(() => new ZodIntersectionFaker(schema)).not.toThrow()
})

test('ZodIntersectionFaker should return a ZodIntersectionFaker instance', () => {
  const schema = z.intersection(Person, Employee)
  const faker = new ZodIntersectionFaker(schema)
  expect(faker instanceof ZodIntersectionFaker).toBe(true)
})

test('ZodIntersectionFaker.fake should be a function', () => {
  const schema = z.intersection(Person, Employee)
  const faker = new ZodIntersectionFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodIntersectionFaker.fake should return the given type', () => {
  const schema = z.intersection(Person, Employee)
  const faker = new ZodIntersectionFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, { name: string } & { role: string }>>(true)
})

testMultipleTimes('any + any', () => {
  install()

  const schema = z.intersection(z.any(), z.any())
  const faker = new ZodIntersectionFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data)).toEqual({ success: true, data })
})

testMultipleTimes('any + the other', () => {
  install()

  const schema = z.intersection(z.any(), z.number())
  const faker = new ZodIntersectionFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data)).toEqual({ success: true, data })
})

testMultipleTimes('the other + any', () => {
  install()

  const schema = z.intersection(z.number(), z.any())
  const faker = new ZodIntersectionFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data)).toEqual({ success: true, data })
})

testMultipleTimes('unknown + unknown', () => {
  install()

  const schema = z.intersection(z.unknown(), z.unknown())
  const faker = new ZodIntersectionFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data)).toEqual({ success: true, data })
})

testMultipleTimes('unknown + the other', () => {
  install()

  const schema = z.intersection(z.unknown(), z.number())
  const faker = new ZodIntersectionFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data)).toEqual({ success: true, data })
})

testMultipleTimes('the other + unknown', () => {
  install()

  const schema = z.intersection(z.number(), z.unknown())
  const faker = new ZodIntersectionFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data)).toEqual({ success: true, data })
})

testMultipleTimes('undefined + undefined', () => {
  install()

  const schema = z.intersection(z.undefined(), z.undefined())
  const faker = new ZodIntersectionFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data)).toEqual({ success: true, data })
})

testMultipleTimes('undefined + optional', () => {
  install()

  const schema = z.intersection(z.undefined(), z.number().optional())
  const faker = new ZodIntersectionFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data)).toEqual({ success: true, data })
})

testMultipleTimes('optional + undefined', () => {
  install()

  const schema = z.intersection(z.number().optional(), z.undefined())
  const faker = new ZodIntersectionFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data)).toEqual({ success: true, data })
})

testMultipleTimes('optional + optional', () => {
  install()

  const schema = z.intersection(z.number().optional(), z.string().optional())
  const faker = new ZodIntersectionFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data)).toEqual({ success: true, data })
})

testMultipleTimes('null + null', () => {
  install()

  const schema = z.intersection(z.null(), z.null())
  const faker = new ZodIntersectionFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data)).toEqual({ success: true, data })
})

testMultipleTimes('null + nullable', () => {
  install()

  const schema = z.intersection(z.null(), z.string().nullable())
  const faker = new ZodIntersectionFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data)).toEqual({ success: true, data })
})

testMultipleTimes('nullable + null', () => {
  install()

  const schema = z.intersection(z.string().nullable(), z.null())
  const faker = new ZodIntersectionFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data)).toEqual({ success: true, data })
})

testMultipleTimes('nullable + nullable', () => {
  install()

  const schema = z.intersection(z.string().nullable(), z.number().nullable())
  const faker = new ZodIntersectionFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data)).toEqual({ success: true, data })
})

testMultipleTimes('nullish + nullish (same type)', () => {
  install()

  const schema = z.intersection(z.number().nullish(), z.number().nullish())
  const faker = new ZodIntersectionFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data)).toEqual({ success: true, data })
})

testMultipleTimes('nullish + optional (same type)', () => {
  install()

  const schema = z.intersection(z.number().nullish(), z.number().optional())
  const faker = new ZodIntersectionFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data)).toEqual({ success: true, data })
})

testMultipleTimes('optional + nullish (same type)', () => {
  install()

  const schema = z.intersection(z.number().optional(), z.number().nullish())
  const faker = new ZodIntersectionFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data)).toEqual({ success: true, data })
})

testMultipleTimes('object + object', () => {
  install()

  const schema = z.intersection(Person, Employee)
  const faker = new ZodIntersectionFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data)).toEqual({ success: true, data })
})
