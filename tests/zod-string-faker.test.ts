import { expect, test } from 'vitest'
import * as z from 'zod'
import { zodStringFaker, ZodStringFaker } from '../src/zod-string-faker'
import { expectType, TypeEqual } from 'ts-expect'
import { testMultipleTimes } from './util'

test('ZodStringFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => zodStringFaker(invalidSchema)).toThrow()
})

test('ZodStringFaker should accepts a ZodString schema', () => {
  const schema = z.string()
  expect(() => zodStringFaker(schema)).not.toThrow()
})

test('ZodStringFaker should return a ZodStringFaker instance', () => {
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

test('base64', () => {
  const schema = z.string().base64()
  const faker = zodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('base64url', () => {
  const schema = z.string().base64url()
  const faker = zodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('cidr', () => {
  const schema = z.string().cidr()
  const faker = zodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('cidr v4', () => {
  const schema = z.string().cidr()
  const faker = zodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('cidr v6', () => {
  const schema = z.string().cidr({ version: 'v6' })
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

test('cuid2', () => {
  const schema = z.string().cuid2()
  const faker = zodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('date', () => {
  const schema = z.string().date()
  const faker = zodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('datetime', () => {
  const schema = z.string().datetime()
  const faker = zodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('duration', () => {
  const schema = z.string().duration()
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

testMultipleTimes('emoji', () => {
  const schema = z.string().emoji()
  const faker = zodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('endsWith', () => {
  const schema = z.string().endsWith('ABC')
  const faker = zodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('includes', () => {
  const schema = z.string().includes('ABC')
  const faker = zodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('ip', () => {
  const schema = z.string().ip()
  const faker = zodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('ip v4', () => {
  const schema = z.string().ip({ version: 'v4' })
  const faker = zodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('ip v6', () => {
  const schema = z.string().ip({ version: 'v6' })
  const faker = zodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('jwt', () => {
  const schema = z.string().jwt()
  const faker = zodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('length', () => {
  const schema = z.string().length(5)
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

test('min', () => {
  const schema = z.string().min(100)
  const faker = zodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('nanoid', () => {
  const schema = z.string().nanoid()
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

test('startsWith', () => {
  const schema = z.string().startsWith('ABC')
  const faker = zodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('time', () => {
  const schema = z.string().time()
  const faker = zodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('toLowerCase', () => {
  const schema = z.string().toLowerCase()
  const faker = zodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('toUpperCase', () => {
  const schema = z.string().toUpperCase()
  const faker = zodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('trim', () => {
  const schema = z.string().trim()
  const faker = zodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('ulid', () => {
  const schema = z.string().ulid()
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
