import * as z from 'zod'
import { zodEnumFaker, ZodEnumFaker } from '../src/zod-enum-faker'
import { expectType, TypeEqual } from 'ts-expect'
import { install } from '../src'

test('ZodEnumFaker should assert parameters', () => {
  const schema = void 0 as any
  expect(() => zodEnumFaker(schema)).toThrow()
})

test('ZodEnumFaker should accepts a ZodEnum schema', () => {
  const schema = z.enum(['foo', 'bar'])
  expect(() => zodEnumFaker(schema)).not.toThrow()
})

test('zodEnumFaker should return a ZodEnumFaker instance', () => {
  expect(typeof zodEnumFaker).toBe('function')

  const schema = z.enum(['foo', 'bar'])
  const faker = zodEnumFaker(schema)
  expect(faker instanceof ZodEnumFaker).toBe(true)
})

test('ZodEnumFaker.fake should be a function', () => {
  const schema = z.enum(['foo', 'bar'])
  const faker = zodEnumFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodEnumFaker.fake should return the given type', () => {
  const schema = z.enum(['foo', 'bar'])
  const faker = zodEnumFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, 'foo' | 'bar'>>(true)
})

test('ZodEnumFaker.fake should return a valid data', () => {
  install()

  const schema = z.enum(['foo', 'bar'])
  const faker = zodEnumFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('ZodEnumFaker.fake.extract should return a valid data', () => {
  install()

  const schema = z.enum(['foo', 'bar']).extract(['foo'])
  const faker = zodEnumFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('ZodEnumFaker.fake.exclude should return a valid data', () => {
  install()

  const schema = z.enum(['foo', 'bar']).exclude(['foo'])
  const faker = zodEnumFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})
