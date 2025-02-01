import { expect, test } from 'vitest'
import { z } from 'zod'
import { ZodCatchFaker } from '../src/zod-catch-faker'
import { expectType, TypeEqual } from 'ts-expect'
import { install } from '../src'

test('ZodCatchFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => new ZodCatchFaker(invalidSchema)).toThrow()
})

test('ZodCatchFaker should accepts a ZodCatch schema', () => {
  const schema = z.number().catch(42)
  expect(() => new ZodCatchFaker(schema)).not.toThrow()
})

test('ZodCatchFaker should return a ZodCatchFaker instance', () => {
  const schema = z.number().catch(42)
  const faker = new ZodCatchFaker(schema)
  expect(faker instanceof ZodCatchFaker).toBe(true)
})

test('ZodCatchFaker.fake should be a function', () => {
  const schema = z.number().catch(42)
  const faker = new ZodCatchFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodCatchFaker.fake should return catch type', () => {
  const schema = z.number().catch(42)
  const faker = new ZodCatchFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, z.infer<typeof schema>>>(true)
})

test('ZodCatchFaker.fake should return a valid data', () => {
  install()
  const schema = z.number().catch(42)
  const faker = new ZodCatchFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('ZodCatchFaker.fake should sometimes return catch value', () => {
  install()
  const schema = z.number().catch(42)
  const faker = new ZodCatchFaker(schema)
  while (true) {
    const data = faker.fake()
    if (data === 42) {
      return
    }
  }
})

test('ZodCatchFaker.fake should sometimes not return catch value', () => {
  install()
  const schema = z.number().catch(42)
  const faker = new ZodCatchFaker(schema)
  while (true) {
    const data = faker.fake()
    if (data !== 42) {
      return
    }
  }
})
