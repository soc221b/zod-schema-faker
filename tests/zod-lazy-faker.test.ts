import * as z from 'zod'
import { zodLazyFaker, ZodLazyFaker } from '../src/zod-lazy-faker'
import { expectType, TypeEqual } from 'ts-expect'
import { install } from '../src'
import { testMultipleTimes } from './util'

interface Category {
  name: string
  subcategories: Category[]
}

test('ZodLazyFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => zodLazyFaker(invalidSchema)).toThrow()
})

test('ZodLazyFaker should accepts a ZodLazy schema', () => {
  const schema = z.lazy(() =>
    z.object({
      name: z.string(),
      subcategories: z.array(schema),
    }),
  ) as z.ZodType<Category>
  expect(() => zodLazyFaker(schema)).not.toThrow()
})

test('ZodLazyFaker should return a ZodLazyFaker instance', () => {
  expect(typeof zodLazyFaker).toBe('function')

  const schema = z.lazy(() =>
    z.object({
      name: z.string(),
      subcategories: z.array(schema),
    }),
  ) as z.ZodType<Category>
  const faker = zodLazyFaker(schema)
  expect(faker instanceof ZodLazyFaker).toBe(true)
})

test('ZodLazyFaker.fake should be a function', () => {
  const schema = z.lazy(() =>
    z.object({
      name: z.string(),
      subcategories: z.array(schema),
    }),
  ) as z.ZodType<Category>
  const faker = zodLazyFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodLazyFaker.fake should return the given type', () => {
  const schema = z.lazy(() =>
    z.object({
      name: z.string(),
      subcategories: z.array(schema),
    }),
  ) as z.ZodType<Category>
  const faker = zodLazyFaker(schema)
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
  const faker = zodLazyFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})
