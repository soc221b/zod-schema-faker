import { describe, expect, test } from 'vitest'
import * as z from 'zod'
import { zodNumberFaker, ZodNumberFaker } from '../src/zod-number-faker'
import { expectType, TypeEqual } from 'ts-expect'

test('ZodNumberFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => zodNumberFaker(invalidSchema)).toThrow()
})

test('ZodNumberFaker should accepts a ZodNumber schema', () => {
  const schema = z.number()
  expect(() => zodNumberFaker(schema)).not.toThrow()
})

test('ZodNumberFaker should return a ZodNumberFaker instance', () => {
  expect(typeof zodNumberFaker).toBe('function')

  const schema = z.number()
  const faker = zodNumberFaker(schema)
  expect(faker instanceof ZodNumberFaker).toBe(true)
})

test('ZodNumberFaker.fake should be a function', () => {
  const schema = z.number()
  const faker = zodNumberFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodNumberFaker.fake should return number type', () => {
  const schema = z.number()
  const faker = zodNumberFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, number>>(true)
})

test('ZodNumberFaker.fake should return a valid data', () => {
  const schema = z.number()
  const faker = zodNumberFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('gt', () => {
  const schema = z.number().gt(1e9)
  const faker = zodNumberFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('gte', () => {
  const schema = z.number().gte(1e9)
  const faker = zodNumberFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('min', () => {
  const schema = z.number().min(1e9)
  const faker = zodNumberFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('lt', () => {
  const schema = z.number().gt(-1e9)
  const faker = zodNumberFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('lte', () => {
  const schema = z.number().gte(-1e9)
  const faker = zodNumberFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('max', () => {
  const schema = z.number().max(-1e9)
  const faker = zodNumberFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('int', () => {
  const schema = z.number().int()
  const faker = zodNumberFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('positive', () => {
  const schema = z.number().positive()
  const faker = zodNumberFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('non-positive', () => {
  const schema = z.number().nonpositive()
  const faker = zodNumberFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('negative', () => {
  const schema = z.number().negative()
  const faker = zodNumberFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('non-negative', () => {
  const schema = z.number().nonnegative()
  const faker = zodNumberFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('multipleOf', () => {
  const schema = z.number().multipleOf(37)
  const faker = zodNumberFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('finite', () => {
  const schema = z.number().finite()
  const faker = zodNumberFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('safe', () => {
  const schema = z.number().safe()
  const faker = zodNumberFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

describe('edge case', () => {
  test('positive + int', () => {
    const schema = z.number().positive().int().lte(1)
    const faker = zodNumberFaker(schema)
    const data = faker.fake()
    expect(data).toBe(1)
    expect(schema.safeParse(data).success).toBe(true)
  })

  test('nonpositive + int', () => {
    const schema = z.number().nonpositive().int().gte(0)
    const faker = zodNumberFaker(schema)
    const data = faker.fake()
    expect(data).toBe(0)
    expect(schema.safeParse(data).success).toBe(true)
  })

  test('negative + int', () => {
    const schema = z.number().negative().int().gte(-1)
    const faker = zodNumberFaker(schema)
    const data = faker.fake()
    expect(data).toBe(-1)
    expect(schema.safeParse(data).success).toBe(true)
  })

  test('nonnegative + int', () => {
    const schema = z.number().nonnegative().int().lte(0)
    const faker = zodNumberFaker(schema)
    const data = faker.fake()
    expect(data).toBe(0)
    expect(schema.safeParse(data).success).toBe(true)
  })

  test('positive + float', () => {
    const schema = z.number().positive().lte(0.000000000000001)
    const faker = zodNumberFaker(schema)
    const data = faker.fake()
    expect(data).toBe(0.000000000000001)
    expect(schema.safeParse(data).success).toBe(true)
  })

  test('negative + float', () => {
    const schema = z.number().negative().gte(-0.000000000000001)
    const faker = zodNumberFaker(schema)
    const data = faker.fake()
    expect(data).toBe(-0.000000000000001)
    expect(schema.safeParse(data).success).toBe(true)
  })

  test('multipleOf', () => {
    // https://github.com/colinhacks/zod/blob/v3.24.1/src/types.ts#L1480
    const schema = z.number().multipleOf(0.000001)
    const faker = zodNumberFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data).success).toBe(true)
  })

  test('multipleOf', () => {
    const schema = z.number().multipleOf(1_234_567_890)
    const faker = zodNumberFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data).success).toBe(true)
  })
})
