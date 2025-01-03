import { expect, test } from 'vitest'
import * as z from 'zod'
import { zodSymbolFaker, ZodSymbolFaker } from '../src/zod-symbol-faker'
import { expectType, TypeEqual } from 'ts-expect'

test('ZodSymbolFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => zodSymbolFaker(invalidSchema)).toThrow()
})

test('ZodSymbolFaker should accepts a ZodSymbol schema', () => {
  const schema = z.symbol()
  expect(() => zodSymbolFaker(schema)).not.toThrow()
})

test('ZodSymbolFaker should return a ZodSymbolFaker instance', () => {
  expect(typeof zodSymbolFaker).toBe('function')

  const schema = z.symbol()
  const faker = zodSymbolFaker(schema)
  expect(faker instanceof ZodSymbolFaker).toBe(true)
})

test('ZodSymbolFaker.fake should be a function', () => {
  const schema = z.symbol()
  const faker = zodSymbolFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodSymbolFaker.fake should return the given type', () => {
  const schema = z.symbol()
  const faker = zodSymbolFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, z.infer<typeof schema>>>(true)
})

test('ZodSymbolFaker.fake should return a valid data', () => {
  const schema = z.symbol()
  const faker = zodSymbolFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})
