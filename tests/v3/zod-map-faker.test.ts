import { expectType, TypeEqual } from 'ts-expect'
import { expect, test } from 'vitest'
import { z } from 'zod/v3'
import { install } from '../../src/v3'
import { ZodMapFaker } from '../../src/v3/zod-map-faker'

test('ZodMapFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => new ZodMapFaker(invalidSchema)).toThrow()
})

test('ZodMapFaker should accepts a ZodMap schema', () => {
  const schema = z.map(z.number(), z.string())
  expect(() => new ZodMapFaker(schema)).not.toThrow()
})

test('ZodMapFaker should return a ZodMapFaker instance', () => {
  const schema = z.map(z.number(), z.string())
  const faker = new ZodMapFaker(schema)
  expect(faker instanceof ZodMapFaker).toBe(true)
})

test('ZodMapFaker.fake should be a function', () => {
  const schema = z.map(z.number(), z.string())
  const faker = new ZodMapFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodMapFaker.fake should return Map type', () => {
  const schema = z.map(z.number(), z.string())
  const faker = new ZodMapFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, Map<number, string>>>(true)
})

test('ZodMapFaker.fake should return a valid data', () => {
  install()

  const schema = z.map(z.number(), z.string())
  const faker = new ZodMapFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})
