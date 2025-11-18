import { expect, test } from 'vitest'
import { z } from 'zod/v3'
import { ZodUnknownFaker } from '../../src/v3/zod-unknown-faker'
import { expectType, TypeEqual } from 'ts-expect'
import { install } from '../../src/v3'

test('ZodUnknownFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => new ZodUnknownFaker(invalidSchema)).toThrow()
})

test('ZodUnknownFaker should accepts a ZodUnknown schema', () => {
  const schema = z.unknown()
  expect(() => new ZodUnknownFaker(schema)).not.toThrow()
})

test('ZodUnknownFaker should return a ZodUnknownFaker instance', () => {
  const schema = z.unknown()
  const faker = new ZodUnknownFaker(schema)
  expect(faker instanceof ZodUnknownFaker).toBe(true)
})

test('ZodUnknownFaker.fake should be a function', () => {
  const schema = z.unknown()
  const faker = new ZodUnknownFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodUnknownFaker.fake should return unknown type', () => {
  const schema = z.unknown()
  const faker = new ZodUnknownFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, unknown>>(true)
})

test('ZodUnknownFaker.fake should return a valid data', () => {
  install()
  const schema = z.unknown()
  const faker = new ZodUnknownFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})
