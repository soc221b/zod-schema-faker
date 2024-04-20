import * as z from 'zod'
import { zodIntersectionFaker, ZodIntersectionFaker } from '../src/zod-intersection-faker'
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
  expect(() => zodIntersectionFaker(invalidSchema)).toThrow()
})

test('ZodIntersectionFaker should accepts a ZodIntersection schema', () => {
  const schema = z.intersection(Person, Employee)
  expect(() => zodIntersectionFaker(schema)).not.toThrow()
})

test('zodIntersectionFaker should return a ZodIntersectionFaker instance', () => {
  expect(typeof zodIntersectionFaker).toBe('function')

  const schema = z.intersection(Person, Employee)
  const faker = zodIntersectionFaker(schema)
  expect(faker instanceof ZodIntersectionFaker).toBe(true)
})

test('ZodIntersectionFaker.fake should be a function', () => {
  const schema = z.intersection(Person, Employee)
  const faker = zodIntersectionFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodIntersectionFaker.fake should return intersection type', () => {
  const schema = z.intersection(Person, Employee)
  const faker = zodIntersectionFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, { name: string } & { role: string }>>(true)
})

test('ZodIntersectionFaker.fake should return a valid data (primitive)', () => {
  install()

  const schema = z.intersection(z.literal('foo'), z.literal('foo'))
  const faker = zodIntersectionFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('ZodIntersectionFaker.fake should return a valid data (date)', () => {
  install()

  const schema = z.intersection(z.date(), z.date())
  const faker = zodIntersectionFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('ZodIntersectionFaker.fake should return a valid data (object)', () => {
  install()

  const schema = z.intersection(z.object({ foo: z.literal('foo') }), z.object({ foo: z.literal('foo') }))
  const faker = zodIntersectionFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('ZodIntersectionFaker.fake should return a valid data (object, no intersection)', () => {
  install()

  const schema = z.intersection(z.object({ foo: z.literal('foo') }), z.object({ foo: z.literal('bar') }))
  const faker = zodIntersectionFaker(schema)
  expect(() => faker.fake()).toThrow()
})

testMultipleTimes('ZodIntersectionFaker.fake should return a valid data (array)', () => {
  install()

  const schema = z.intersection(z.array(z.literal('foo')), z.array(z.literal('foo')))
  const faker = zodIntersectionFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

testMultipleTimes('ZodIntersectionFaker.fake should return a valid data (array, no intersection)', () => {
  install()

  const schema = z.intersection(z.array(z.literal('foo')).length(1), z.array(z.literal('bar')).length(1))
  const faker = zodIntersectionFaker(schema)
  expect(() => faker.fake()).toThrow()
})

test('ZodIntersectionFaker.fake should return a valid data (no intersection)', () => {
  install()

  const schema = z.intersection(z.literal('foo'), z.literal('bar'))
  const faker = zodIntersectionFaker(schema)
  expect(() => faker.fake()).toThrow()
})
