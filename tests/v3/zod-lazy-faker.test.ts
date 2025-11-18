import { expect, test } from 'vitest'
import { z } from 'zod/v3'
import { ZodLazyFaker } from '../../src/v3/zod-lazy-faker'
import { expectType, TypeEqual } from 'ts-expect'
import { install } from '../../src/v3'
import { testMultipleTimes } from './util'

interface Category {
  name: string
  subcategories: Category[]
}

test('ZodLazyFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => new ZodLazyFaker(invalidSchema)).toThrow()
})

test('ZodLazyFaker should accepts a ZodLazy schema', () => {
  const schema = z.lazy(() =>
    z.object({
      name: z.string(),
      subcategories: z.array(schema),
    }),
  ) as z.ZodType<Category>
  expect(() => new ZodLazyFaker(schema)).not.toThrow()
})

test('ZodLazyFaker should return a ZodLazyFaker instance', () => {
  const schema = z.lazy(() =>
    z.object({
      name: z.string(),
      subcategories: z.array(schema),
    }),
  ) as z.ZodType<Category>
  const faker = new ZodLazyFaker(schema)
  expect(faker instanceof ZodLazyFaker).toBe(true)
})

test('ZodLazyFaker.fake should be a function', () => {
  const schema = z.lazy(() =>
    z.object({
      name: z.string(),
      subcategories: z.array(schema),
    }),
  ) as z.ZodType<Category>
  const faker = new ZodLazyFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodLazyFaker.fake should return the given type', () => {
  const schema = z.lazy(() =>
    z.object({
      name: z.string(),
      subcategories: z.array(schema),
    }),
  ) as z.ZodType<Category>
  const faker = new ZodLazyFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, Category>>(true)
})

testMultipleTimes('ZodLazyFaker.fake should return a valid data', () => {
  install()

  const schema = z.lazy(() =>
    z.object({
      name: z.string(),
      subcategories: z.array(schema),
    }),
  ) as z.ZodType<Category>
  const faker = new ZodLazyFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})
