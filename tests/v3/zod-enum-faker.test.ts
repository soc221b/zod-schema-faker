import { expectType, TypeEqual } from 'ts-expect'
import { expect, test } from 'vitest'
import { z } from 'zod/v3'
import { install } from '../../src/v3'
import { ZodEnumFaker } from '../../src/v3/zod-enum-faker'

test('ZodEnumFaker should assert parameters', () => {
  const schema = void 0 as any
  expect(() => new ZodEnumFaker(schema)).toThrow()
})

test('ZodEnumFaker should accepts a ZodEnum schema', () => {
  const schema = z.enum(['foo', 'bar'])
  expect(() => new ZodEnumFaker(schema)).not.toThrow()
})

test('ZodEnumFaker should return a ZodEnumFaker instance', () => {
  const schema = z.enum(['foo', 'bar'])
  const faker = new ZodEnumFaker(schema)
  expect(faker instanceof ZodEnumFaker).toBe(true)
})

test('ZodEnumFaker.fake should be a function', () => {
  const schema = z.enum(['foo', 'bar'])
  const faker = new ZodEnumFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodEnumFaker.fake should return the given type', () => {
  const schema = z.enum(['foo', 'bar'])
  const faker = new ZodEnumFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, 'foo' | 'bar'>>(true)
})

test('ZodEnumFaker.fake should return a valid data', () => {
  install()

  const schema = z.enum(['foo', 'bar'])
  const faker = new ZodEnumFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('ZodEnumFaker.fake.extract should return a valid data', () => {
  install()

  const schema = z.enum(['foo', 'bar']).extract(['foo'])
  const faker = new ZodEnumFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('ZodEnumFaker.fake.exclude should return a valid data', () => {
  install()

  const schema = z.enum(['foo', 'bar']).exclude(['foo'])
  const faker = new ZodEnumFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})
