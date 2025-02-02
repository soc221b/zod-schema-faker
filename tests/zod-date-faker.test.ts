import { describe, expect, test } from 'vitest'
import { z } from 'zod'
import { ZodDateFaker } from '../src/zod-date-faker'
import { expectType, TypeEqual } from 'ts-expect'

test('ZodDateFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => new ZodDateFaker(invalidSchema)).toThrow()
})

test('ZodDateFaker should accepts a ZodDate schema', () => {
  const schema = z.date()
  expect(() => new ZodDateFaker(schema)).not.toThrow()
})

test('ZodDateFaker should return a ZodDateFaker instance', () => {
  const schema = z.date()
  const faker = new ZodDateFaker(schema)
  expect(faker instanceof ZodDateFaker).toBe(true)
})

test('ZodDateFaker.fake should be a function', () => {
  const schema = z.date()
  const faker = new ZodDateFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodDateFaker.fake should return date type', () => {
  const schema = z.date()
  const faker = new ZodDateFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, Date>>(true)
})

test('ZodDateFaker.fake should return a valid data', () => {
  const schema = z.date()
  const faker = new ZodDateFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('min', () => {
  const schema = z.date().min(new Date('2000-01-01'))
  const faker = new ZodDateFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('max', () => {
  const schema = z.date().max(new Date('2000-01-01'))
  const faker = new ZodDateFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('should sometimes generate an edge date (min)', () => {
  const schema = z.date()
  const faker = new ZodDateFaker(schema)
  while (true) {
    const data = faker.fake()
    if (data.getTime() < new Date('1970-01-01').getTime()) {
      break
    }
  }
})

test('should sometimes generate an edge date (max)', () => {
  const schema = z.date()
  const faker = new ZodDateFaker(schema)
  while (true) {
    const data = faker.fake()
    if (data.getTime() > new Date('2038-01-19').getTime()) {
      break
    }
  }
})

describe('multiple checks of the same kind', () => {
  test('min', () => {
    const schema = z
      .date()
      .min(new Date('2000-01-01T00:00:00.000Z'))
      .min(new Date('2002-01-01T00:00:00.000Z'))
      .min(new Date('2001-01-01T00:00:00.000Z'))
      .max(new Date('2002-01-01T00:00:00.000Z'))
    const faker = new ZodDateFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data).data).toEqual(new Date('2002-01-01T00:00:00.000Z'))
  })

  test('max', () => {
    const schema = z
      .date()
      .max(new Date('2002-01-01T00:00:00.000Z'))
      .max(new Date('2000-01-01T00:00:00.000Z'))
      .max(new Date('2001-01-01T00:00:00.000Z'))
      .min(new Date('2000-01-01T00:00:00.000Z'))
    const faker = new ZodDateFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data).data).toEqual(new Date('2000-01-01T00:00:00.000Z'))
  })
})
