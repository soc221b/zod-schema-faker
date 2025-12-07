import { expectType, TypeEqual } from 'ts-expect'
import { expect, test } from 'vitest'
import { z } from 'zod/v3'
import { install } from '../../src/v3'
import { ZodUnionFaker } from '../../src/v3/zod-union-faker'

test('ZodUnionFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => new ZodUnionFaker(invalidSchema)).toThrow()
})

test('ZodUnionFaker should accepts a ZodUnion schema', () => {
  const schema = z.union([z.number(), z.string()])
  expect(() => new ZodUnionFaker(schema)).not.toThrow()
})

test('ZodUnionFaker should return a ZodUnionFaker instance', () => {
  const schema = z.union([z.number(), z.string()])
  const faker = new ZodUnionFaker(schema)
  expect(faker instanceof ZodUnionFaker).toBe(true)
})

test('ZodUnionFaker.fake should be a function', () => {
  const schema = z.union([z.number(), z.string()])
  const faker = new ZodUnionFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodUnionFaker.fake should return union type', () => {
  const schema = z.union([z.number(), z.string()])
  const faker = new ZodUnionFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, number | string>>(true)
})

test('ZodUnionFaker.fake should return a valid data', () => {
  install()

  const schema = z.union([z.number(), z.string()])
  const faker = new ZodUnionFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})
