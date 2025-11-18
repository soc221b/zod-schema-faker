import { expectType, TypeEqual } from 'ts-expect'
import { describe, expect, test } from 'vitest'
import { z } from 'zod/v3'
import { install } from '../../src/v3'
import { ZodSetFaker } from '../../src/v3/zod-set-faker'

test('ZodSetFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => new ZodSetFaker(invalidSchema)).toThrow()
})

test('ZodSetFaker should accepts a ZodSet schema', () => {
  const schema = z.set(z.number())
  expect(() => new ZodSetFaker(schema)).not.toThrow()
})

test('ZodSetFaker should return a ZodSetFaker instance', () => {
  const schema = z.set(z.number())
  const faker = new ZodSetFaker(schema)
  expect(faker instanceof ZodSetFaker).toBe(true)
})

test('ZodSetFaker.fake should be a function', () => {
  const schema = z.set(z.number())
  const faker = new ZodSetFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodSetFaker.fake should return set type', () => {
  const schema = z.set(z.number())
  const faker = new ZodSetFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, Set<number>>>(true)
})

test('ZodSetFaker.fake should return a valid data', () => {
  install()

  const schema = z.set(z.number())
  const faker = new ZodSetFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('non-empty', () => {
  install()

  const schema = z.set(z.number()).nonempty()
  const faker = new ZodSetFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('min', () => {
  install()

  const schema = z.set(z.number()).min(5)
  const faker = new ZodSetFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('max', () => {
  install()

  const schema = z.set(z.number()).max(5)
  const faker = new ZodSetFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('size', () => {
  install()

  const schema = z.set(z.number()).size(5)
  const faker = new ZodSetFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

describe('impossible case', () => {
  test('min > max', () => {
    install()

    const schema = z.set(z.number()).min(10).max(5)
    const faker = new ZodSetFaker(schema)
    expect(() => faker.fake()).toThrow(RangeError)
  })
})
