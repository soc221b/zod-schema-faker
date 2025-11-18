import { expect, test } from 'vitest'
import { z } from 'zod/v3'
import { ZodAnyFaker } from '../../src/v3/zod-any-faker'
import { expectType, TypeEqual } from 'ts-expect'
import { install } from '../../src/v3'

test('ZodAnyFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => new ZodAnyFaker(invalidSchema)).toThrow()
})

test('ZodAnyFaker should accepts a ZodAny schema', () => {
  const schema = z.any()
  expect(() => new ZodAnyFaker(schema)).not.toThrow()
})

test('ZodAnyFaker should return a ZodAnyFaker instance', () => {
  const schema = z.any()
  const faker = new ZodAnyFaker(schema)
  expect(faker instanceof ZodAnyFaker).toBe(true)
})

test('ZodAnyFaker.fake should be a function', () => {
  const schema = z.any()
  const faker = new ZodAnyFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodAnyFaker.fake should return any type', () => {
  const schema = z.any()
  const faker = new ZodAnyFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, any>>(true)
})

test('ZodAnyFaker.fake should return a valid data', () => {
  install()
  const schema = z.any()
  const faker = new ZodAnyFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})
