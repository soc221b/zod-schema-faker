import { expect, test } from 'vitest'
import { z } from 'zod/v3'
import { ZodNeverFaker } from '../../src/v3/zod-never-faker'
import { expectType, TypeEqual } from 'ts-expect'

test('ZodNeverFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => new ZodNeverFaker(invalidSchema)).toThrow()
})

test('ZodNeverFaker should accepts a ZodNever schema', () => {
  const schema = z.never()
  expect(() => new ZodNeverFaker(schema)).not.toThrow()
})

test('ZodNeverFaker should return a ZodNeverFaker instance', () => {
  const schema = z.never()
  const faker = new ZodNeverFaker(schema)
  expect(faker instanceof ZodNeverFaker).toBe(true)
})

test('ZodNeverFaker.fake should be a function', () => {
  const schema = z.never()
  const faker = new ZodNeverFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodNeverFaker.fake should return never type', () => {
  const schema = z.never()
  const faker = new ZodNeverFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, never>>(true)
})

test('ZodNullFaker.fake should throw an error', () => {
  const schema = z.never()
  const faker = new ZodNeverFaker(schema)
  expect(() => faker.fake()).toThrow()
})
