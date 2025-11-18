import { expect, test } from 'vitest'
import { z } from 'zod/v3'
import { ZodSymbolFaker } from '../../src/v3/zod-symbol-faker'
import { expectType, TypeEqual } from 'ts-expect'

test('ZodSymbolFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => new ZodSymbolFaker(invalidSchema)).toThrow()
})

test('ZodSymbolFaker should accepts a ZodSymbol schema', () => {
  const schema = z.symbol()
  expect(() => new ZodSymbolFaker(schema)).not.toThrow()
})

test('ZodSymbolFaker should return a ZodSymbolFaker instance', () => {
  const schema = z.symbol()
  const faker = new ZodSymbolFaker(schema)
  expect(faker instanceof ZodSymbolFaker).toBe(true)
})

test('ZodSymbolFaker.fake should be a function', () => {
  const schema = z.symbol()
  const faker = new ZodSymbolFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodSymbolFaker.fake should return the given type', () => {
  const schema = z.symbol()
  const faker = new ZodSymbolFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, z.infer<typeof schema>>>(true)
})

test('ZodSymbolFaker.fake should return a valid data', () => {
  const schema = z.symbol()
  const faker = new ZodSymbolFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})
