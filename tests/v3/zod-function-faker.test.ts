import { expectType, TypeEqual } from 'ts-expect'
import { expect, test } from 'vitest'
import { z } from 'zod/v3'
import { install } from '../../src/v3'
import { ZodFunctionFaker } from '../../src/v3/zod-function-faker'

test('ZodFunctionFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => new ZodFunctionFaker(invalidSchema)).toThrow()
})

test('ZodFunctionFaker should accepts a ZodFunction schema', () => {
  const schema = z.function(z.tuple([z.number(), z.string()]), z.boolean())
  expect(() => new ZodFunctionFaker(schema)).not.toThrow()
})

test('ZodFunctionFaker should return a ZodFunctionFaker instance', () => {
  const schema = z.function(z.tuple([z.number(), z.string()]), z.boolean())
  const faker = new ZodFunctionFaker(schema)
  expect(faker instanceof ZodFunctionFaker).toBe(true)
})

test('ZodFunctionFaker.fake should be a function', () => {
  const schema = z.function(z.tuple([z.number(), z.string()]), z.boolean())
  const faker = new ZodFunctionFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodFunctionFaker.fake should return function type', () => {
  const schema = z.function(z.tuple([z.number(), z.string()]), z.boolean())
  const faker = new ZodFunctionFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, (_: number, __: string) => boolean>>(true)
})

test('ZodFunctionFaker.fake should return a valid data', () => {
  install()

  const schema = z.function(z.tuple([z.number(), z.string()]), z.boolean())
  const faker = new ZodFunctionFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('ZodFunctionFaker.fake when the returned function is called, it should return a valid data', () => {
  install()

  const schema = z.function(z.tuple([z.number(), z.string()]), z.boolean())
  const faker = new ZodFunctionFaker(schema)
  const fn = faker.fake()
  expect(schema.safeParse(fn).success).toBe(true)
  expect(z.boolean().safeParse(fn(1, '')).success).toBe(true)
})
