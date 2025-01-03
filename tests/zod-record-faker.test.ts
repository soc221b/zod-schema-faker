import { expect, test } from 'vitest'
import * as z from 'zod'
import { zodRecordFaker, ZodRecordFaker } from '../src/zod-record-faker'
import { expectType, TypeEqual } from 'ts-expect'
import { install } from '../src'

test('ZodRecordFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => zodRecordFaker(invalidSchema)).toThrow()
})

test('ZodRecordFaker should assert type of key', () => {
  install()

  const numericalKeySchema = z.record(z.number(), z.any())
  const faker = zodRecordFaker(numericalKeySchema)
  expect(() => faker.fake()).toThrow()
})

test('ZodRecordFaker should accepts a ZodRecord schema', () => {
  const schema = z.record(z.string(), z.number())
  expect(() => zodRecordFaker(schema)).not.toThrow()
})

test('ZodRecordFaker should return a ZodRecordFaker instance', () => {
  expect(typeof zodRecordFaker).toBe('function')

  const schema = z.record(z.string(), z.number())
  const faker = zodRecordFaker(schema)
  expect(faker instanceof ZodRecordFaker).toBe(true)
})

test('ZodRecordFaker.fake should be a function', () => {
  const schema = z.record(z.string(), z.number())
  const faker = zodRecordFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodRecordFaker.fake should return record type', () => {
  const schema = z.record(z.string(), z.number())
  const faker = zodRecordFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, Record<string, number>>>(true)
})

test('ZodRecordFaker.fake should return a valid data', () => {
  install()

  const schema = z.record(z.string(), z.number())
  const faker = zodRecordFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})
