import { expect, test } from 'vitest'
import { z } from 'zod'
import { zodUnionFaker, ZodUnionFaker } from '../src/zod-union-faker'
import { expectType, TypeEqual } from 'ts-expect'
import { install } from '../src'

test('ZodUnionFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => zodUnionFaker(invalidSchema)).toThrow()
})

test('ZodUnionFaker should accepts a ZodUnion schema', () => {
  const schema = z.union([z.number(), z.string()])
  expect(() => zodUnionFaker(schema)).not.toThrow()
})

test('ZodUnionFaker should return a ZodUnionFaker instance', () => {
  expect(typeof zodUnionFaker).toBe('function')

  const schema = z.union([z.number(), z.string()])
  const faker = zodUnionFaker(schema)
  expect(faker instanceof ZodUnionFaker).toBe(true)
})

test('ZodUnionFaker.fake should be a function', () => {
  const schema = z.union([z.number(), z.string()])
  const faker = zodUnionFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodUnionFaker.fake should return union type', () => {
  const schema = z.union([z.number(), z.string()])
  const faker = zodUnionFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, number | string>>(true)
})

test('ZodUnionFaker.fake should return a valid data', () => {
  install()

  const schema = z.union([z.number(), z.string()])
  const faker = zodUnionFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})
