import { expectType, TypeEqual } from 'ts-expect'
import { expect, test } from 'vitest'
import { z } from 'zod/v3'
import { install } from '../../src/v3'
import { ZodRecordFaker } from '../../src/v3/zod-record-faker'

test('ZodRecordFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => new ZodRecordFaker(invalidSchema)).toThrow()
})

test('ZodRecordFaker should assert type of key', () => {
  install()

  const numericalKeySchema = z.record(z.number(), z.any())
  const faker = new ZodRecordFaker(numericalKeySchema)
  expect(() => faker.fake()).toThrow()
})

test('ZodRecordFaker should accepts a ZodRecord schema', () => {
  const schema = z.record(z.string(), z.number())
  expect(() => new ZodRecordFaker(schema)).not.toThrow()
})

test('ZodRecordFaker should return a ZodRecordFaker instance', () => {
  const schema = z.record(z.string(), z.number())
  const faker = new ZodRecordFaker(schema)
  expect(faker instanceof ZodRecordFaker).toBe(true)
})

test('ZodRecordFaker.fake should be a function', () => {
  const schema = z.record(z.string(), z.number())
  const faker = new ZodRecordFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodRecordFaker.fake should return record type', () => {
  const schema = z.record(z.string(), z.number())
  const faker = new ZodRecordFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, Record<string, number>>>(true)
})

test('ZodRecordFaker.fake should return a valid data', () => {
  install()

  const schema = z.record(z.string(), z.number())
  const faker = new ZodRecordFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})
