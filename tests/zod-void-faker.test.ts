import * as z from 'zod'
import { zodVoidFaker, ZodVoidFaker } from '../src/zod-void-faker'
import { expectType, TypeEqual } from 'ts-expect'
import { install } from '../src'

test('ZodVoidFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => zodVoidFaker(invalidSchema)).toThrow()
})

test('ZodVoidFaker should accepts a ZodVoid schema', () => {
  const schema = z.void()
  expect(() => zodVoidFaker(schema)).not.toThrow()
})

test('zodVoidFaker should return a ZodVoidFaker instance', () => {
  expect(typeof zodVoidFaker).toBe('function')

  const schema = z.void()
  const faker = zodVoidFaker(schema)
  expect(faker instanceof ZodVoidFaker).toBe(true)
})

test('ZodVoidFaker.fake should be a function', () => {
  const schema = z.void()
  const faker = zodVoidFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodVoidFaker.fake should return void type', () => {
  const schema = z.void()
  const faker = zodVoidFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, void>>(true)
})

test('ZodVoidFaker.fake should return a data (but should not be used)', () => {
  install()
  const schema = z.void()
  const faker = zodVoidFaker(schema)
  expect(() => faker.fake()).not.toThrow()
})
