import { expect, test } from 'vitest'
import * as z from 'zod'
import { zodDiscriminatedUnionFaker, ZodDiscriminatedUnionFaker } from '../src/zod-discriminated-union-faker'
import { expectType, TypeEqual } from 'ts-expect'
import { install } from '../src'

test('ZodDiscriminatedUnionFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => zodDiscriminatedUnionFaker(invalidSchema)).toThrow()
})

test('ZodDiscriminatedUnionFaker should accepts a ZodDiscriminatedUnion schema', () => {
  const schema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('a'), a: z.string() }),
    z.object({ type: z.literal('b'), b: z.string() }),
  ])
  expect(() => zodDiscriminatedUnionFaker(schema)).not.toThrow()
})

test('ZodDiscriminatedUnionFaker should return a ZodDiscriminatedUnionFaker instance', () => {
  expect(typeof zodDiscriminatedUnionFaker).toBe('function')

  const schema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('a'), a: z.string() }),
    z.object({ type: z.literal('b'), b: z.string() }),
  ])
  const faker = zodDiscriminatedUnionFaker(schema)
  expect(faker instanceof ZodDiscriminatedUnionFaker).toBe(true)
})

test('ZodDiscriminatedUnionFaker.fake should be a function', () => {
  const schema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('a'), a: z.string() }),
    z.object({ type: z.literal('b'), b: z.string() }),
  ])
  const faker = zodDiscriminatedUnionFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodDiscriminatedUnionFaker.fake should return the given type', () => {
  const schema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('a'), a: z.string() }),
    z.object({ type: z.literal('b'), b: z.string() }),
  ])
  const faker = zodDiscriminatedUnionFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, { type: 'a'; a: string } | { type: 'b'; b: string }>>(true)
})

test('ZodDiscriminatedUnionFaker.fake should return a valid data', () => {
  install()

  const schema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('a'), a: z.string() }),
    z.object({ type: z.literal('b'), b: z.string() }),
  ])
  const faker = zodDiscriminatedUnionFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})
