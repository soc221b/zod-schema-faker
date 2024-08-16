import * as z from 'zod'
import { zodMapFaker, ZodMapFaker } from '../src/zod-map-faker'
import { expectType, TypeEqual } from 'ts-expect'
import { install } from '../src'

test('ZodMapFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => zodMapFaker(invalidSchema)).toThrow()
})

test('ZodMapFaker should accepts a ZodMap schema', () => {
  const schema = z.map(z.number(), z.string())
  expect(() => zodMapFaker(schema)).not.toThrow()
})

test('ZodMapFaker should return a ZodMapFaker instance', () => {
  expect(typeof zodMapFaker).toBe('function')
  const schema = z.map(z.number(), z.string())
  const faker = zodMapFaker(schema)
  expect(faker instanceof ZodMapFaker).toBe(true)
})

test('ZodMapFaker.fake should be a function', () => {
  const schema = z.map(z.number(), z.string())
  const faker = zodMapFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodMapFaker.fake should return Map type', () => {
  const schema = z.map(z.number(), z.string())
  const faker = zodMapFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, Map<number, string>>>(true)
})

test('ZodMapFaker.fake should return a valid data', () => {
  install()

  const schema = z.map(z.number(), z.string())
  const faker = zodMapFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})
