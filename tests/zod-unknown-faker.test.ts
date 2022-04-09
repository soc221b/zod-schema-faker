import * as z from 'zod'
import { zodUnknownFaker, ZodUnknownFaker } from '../src/zod-unknown-faker'
import { expectType, TypeEqual } from 'ts-expect'
import { install } from '../src'

{
  const data = zodUnknownFaker(z.unknown()).fake()
  expectType<TypeEqual<typeof data, unknown>>(true)
}

test('ZodUnknownFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => zodUnknownFaker(invalidSchema)).toThrow()
})

test('ZodUnknownFaker should accepts a ZodUnknown schema', () => {
  const schema = z.unknown()
  expect(() => zodUnknownFaker(schema)).not.toThrow()
})

test('zodUnknownFaker should return a ZodUnknownFaker instance', () => {
  expect(typeof zodUnknownFaker).toBe('function')

  const schema = z.unknown()
  const faker = zodUnknownFaker(schema)
  expect(faker instanceof ZodUnknownFaker).toBe(true)
})

test('ZodUnknownFaker.fake should be a function', () => {
  const schema = z.unknown()
  const faker = zodUnknownFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodUnknownFaker.fake should return unknown type', () => {
  const schema = z.unknown()
  const faker = zodUnknownFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, unknown>>(true)
})

test('ZodUnknownFaker.fake should return a valid data', () => {
  install()
  const schema = z.unknown()
  const faker = zodUnknownFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})
