import { expect, test } from 'vitest'
import { z } from 'zod'
import { ZodDefaultFaker } from '../src/zod-default-faker'
import { expectType, TypeEqual } from 'ts-expect'
import { install } from '../src'

const defaultData = { foo: 'bar' }

test('ZodDefaultFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => new ZodDefaultFaker(invalidSchema)).toThrow()
})

test('ZodDefaultFaker should accepts a ZodDefault schema', () => {
  const schema = z.object({}).default(defaultData)
  expect(() => new ZodDefaultFaker(schema)).not.toThrow()
})

test('ZodDefaultFaker should return a ZodDefaultFaker instance', () => {
  const schema = z.object({}).default(defaultData)
  const faker = new ZodDefaultFaker(schema)
  expect(faker instanceof ZodDefaultFaker).toBe(true)
})

test('ZodDefaultFaker.fake should be a function', () => {
  const schema = z.object({}).default(defaultData)
  const faker = new ZodDefaultFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodDefaultFaker.fake should return object type', () => {
  const schema = z.object({}).default(defaultData)
  const faker = new ZodDefaultFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, {}>>(true)
})

test('ZodDefaultFaker.fake should sometimes return defaultData', () => {
  install()

  const schema = z.object({}).default(defaultData)
  const faker = new ZodDefaultFaker(schema)

  let i = 0
  while (++i < 1e3) {
    const data = faker.fake()
    expect(schema.safeParse(data).success).toBe(true)
    if (data === defaultData) {
      return
    }
  }

  throw Error('should not reach here')
})

test('ZodDefaultFaker.fake should sometimes return non-defaultData', () => {
  install()

  const schema = z.object({}).default(defaultData)
  const faker = new ZodDefaultFaker(schema)

  let i = 0
  while (++i < 1e3) {
    const data = faker.fake()
    expect(schema.safeParse(data).success).toBe(true)
    if (data !== defaultData) {
      return
    }
  }

  throw Error('should not reach here')
})
