import * as z from 'zod'
import { zodPromiseFaker, ZodPromiseFaker } from '../src/zod-promise-faker'
import { expectType, TypeEqual } from 'ts-expect'
import { install } from '../src'

test('ZodPromiseFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => zodPromiseFaker(invalidSchema)).toThrow()
})

test('ZodPromiseFaker should accepts a ZodPromise schema', () => {
  const schema = z.promise(z.string())
  expect(() => zodPromiseFaker(schema)).not.toThrow()
})

test('ZodPromiseFaker should return a ZodPromiseFaker instance', () => {
  expect(typeof zodPromiseFaker).toBe('function')

  const schema = z.promise(z.string())
  const faker = zodPromiseFaker(schema)
  expect(faker instanceof ZodPromiseFaker).toBe(true)
})

test('ZodPromiseFaker.fake should be a function', () => {
  const schema = z.promise(z.string())
  const faker = zodPromiseFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodPromiseFaker.fake should return promise type', () => {
  const schema = z.promise(z.string())
  const faker = zodPromiseFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, Promise<string>>>(true)
})

test('ZodPromiseFaker.fake should return a valid data', async () => {
  install()

  const schema = z.promise(z.string())
  const faker = zodPromiseFaker(schema)
  const data = faker.fake()
  expect((await schema.safeParseAsync(data)).success).toBe(true)
  await data
})
