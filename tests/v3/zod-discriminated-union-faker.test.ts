import { expect, test } from 'vitest'
import { z } from 'zod/v3'
import { ZodDiscriminatedUnionFaker } from '../../src/v3/zod-discriminated-union-faker'
import { expectType, TypeEqual } from 'ts-expect'
import { install } from '../../src/v3'

test('ZodDiscriminatedUnionFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => new ZodDiscriminatedUnionFaker(invalidSchema)).toThrow()
})

test('ZodDiscriminatedUnionFaker should accepts a ZodDiscriminatedUnion schema', () => {
  const schema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('a'), a: z.string() }),
    z.object({ type: z.literal('b'), b: z.string() }),
  ])
  expect(() => new ZodDiscriminatedUnionFaker(schema)).not.toThrow()
})

test('ZodDiscriminatedUnionFaker should return a ZodDiscriminatedUnionFaker instance', () => {
  const schema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('a'), a: z.string() }),
    z.object({ type: z.literal('b'), b: z.string() }),
  ])
  const faker = new ZodDiscriminatedUnionFaker(schema)
  expect(faker instanceof ZodDiscriminatedUnionFaker).toBe(true)
})

test('ZodDiscriminatedUnionFaker.fake should be a function', () => {
  const schema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('a'), a: z.string() }),
    z.object({ type: z.literal('b'), b: z.string() }),
  ])
  const faker = new ZodDiscriminatedUnionFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodDiscriminatedUnionFaker.fake should return the given type', () => {
  const schema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('a'), a: z.string() }),
    z.object({ type: z.literal('b'), b: z.string() }),
  ])
  const faker = new ZodDiscriminatedUnionFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, { type: 'a'; a: string } | { type: 'b'; b: string }>>(true)
})

test('ZodDiscriminatedUnionFaker.fake should return a valid data', () => {
  install()

  const schema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('a'), a: z.string() }),
    z.object({ type: z.literal('b'), b: z.string() }),
  ])
  const faker = new ZodDiscriminatedUnionFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})
