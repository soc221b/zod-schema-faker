import { expect, test } from 'vitest'
import { z } from 'zod/v3'
import { ZodVoidFaker } from '../../src/v3/zod-void-faker'
import { expectType, TypeEqual } from 'ts-expect'
import { install } from '../../src/v3'

test('ZodVoidFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => new ZodVoidFaker(invalidSchema)).toThrow()
})

test('ZodVoidFaker should accepts a ZodVoid schema', () => {
  const schema = z.void()
  expect(() => new ZodVoidFaker(schema)).not.toThrow()
})

test('ZodVoidFaker should return a ZodVoidFaker instance', () => {
  const schema = z.void()
  const faker = new ZodVoidFaker(schema)
  expect(faker instanceof ZodVoidFaker).toBe(true)
})

test('ZodVoidFaker.fake should be a function', () => {
  const schema = z.void()
  const faker = new ZodVoidFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodVoidFaker.fake should return void type', () => {
  const schema = z.void()
  const faker = new ZodVoidFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, void>>(true)
})

test('ZodVoidFaker.fake should return a valid data', () => {
  install()
  const schema = z.void()
  const faker = new ZodVoidFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})
