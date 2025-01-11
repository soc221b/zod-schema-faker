import { describe, expect, test } from 'vitest'
import { z } from 'zod'
import { ZodBigIntFaker } from '../src/zod-bigint-faker'
import { expectType, TypeEqual } from 'ts-expect'
import { testMultipleTimes } from './util'
import { runFake } from '../src'

test('ZodBigIntFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => new ZodBigIntFaker(invalidSchema)).toThrow()
})

test('ZodBigIntFaker should accepts a ZodBigInt schema', () => {
  const schema = z.bigint()
  expect(() => new ZodBigIntFaker(schema)).not.toThrow()
})

test('ZodBigIntFaker should return a ZodBigIntFaker instance', () => {
  const schema = z.bigint()
  const faker = new ZodBigIntFaker(schema)
  expect(faker instanceof ZodBigIntFaker).toBe(true)
})

test('ZodBigIntFaker.fake should be a function', () => {
  const schema = z.bigint()
  const faker = new ZodBigIntFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodBigIntFaker.fake should return bigint type', () => {
  const schema = z.bigint()
  const faker = new ZodBigIntFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, bigint>>(true)
})

test('ZodBigIntFaker.fake should return a valid data', () => {
  const schema = z.bigint()
  const faker = new ZodBigIntFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('gt', () => {
  const schema = z.bigint().gt(100n)
  const faker = new ZodBigIntFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('gte', () => {
  const schema = z.bigint().gte(100n)
  const faker = new ZodBigIntFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('lt', () => {
  const schema = z.bigint().lt(100n)
  const faker = new ZodBigIntFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('lte', () => {
  const schema = z.bigint().lte(100n)
  const faker = new ZodBigIntFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('positive', () => {
  const schema = z.bigint().positive()
  const faker = new ZodBigIntFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('nonnegative', () => {
  const schema = z.bigint().nonnegative()
  const faker = new ZodBigIntFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('negative', () => {
  const schema = z.bigint().negative()
  const faker = new ZodBigIntFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('nonpositive', () => {
  const schema = z.bigint().nonpositive()
  const faker = new ZodBigIntFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('multiplyOf positive', () => {
  const schema = z.bigint().multipleOf(37n)
  const faker = new ZodBigIntFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('multiplyOf negative', () => {
  const schema = z.bigint().multipleOf(-37n)
  const faker = new ZodBigIntFaker(schema)
  const data = faker.fake()
  if (schema.safeParse(data).success === false) {
    console.log(data)
  }
  expect(schema.safeParse(data).success).toBe(true)
})

describe('edge case', () => {
  test('gt', () => {
    const schema = z.bigint().gt(100n).lte(101n)
    const faker = new ZodBigIntFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data).success).toBe(true)
    expect(data).toBe(101n)
  })

  test('gte', () => {
    const schema = z.bigint().gte(100n).lt(101n)
    const faker = new ZodBigIntFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data).success).toBe(true)
    expect(data).toBe(100n)
  })

  test('lt', () => {
    const schema = z.bigint().lt(100n).gte(99n)
    const faker = new ZodBigIntFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data).success).toBe(true)
    expect(data).toBe(99n)
  })

  test('lte', () => {
    const schema = z.bigint().lte(100n).gt(99n)
    const faker = new ZodBigIntFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data).success).toBe(true)
    expect(data).toBe(100n)
  })

  test('positive', () => {
    const schema = z.bigint().positive().lt(2n)
    const faker = new ZodBigIntFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data).success).toBe(true)
    expect(data).toBe(1n)
  })

  test('nonnegative', () => {
    const schema = z.bigint().nonnegative().lt(1n)
    const faker = new ZodBigIntFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data).success).toBe(true)
    expect(data).toBe(0n)
  })

  test('negative', () => {
    const schema = z.bigint().negative().gt(-2n)
    const faker = new ZodBigIntFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data).success).toBe(true)
    expect(data).toBe(-1n)
  })

  test('nonpositive', () => {
    const schema = z.bigint().nonpositive().gt(-1n)
    const faker = new ZodBigIntFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data).success).toBe(true)
    expect(data).toBe(0n)
  })

  testMultipleTimes('integration', () => {
    const min = runFake(faker => faker.number.bigInt({ min: -1000n, max: 1000n }))
    const max = runFake(faker => faker.number.bigInt({ min, max: min + 1000n }))
    const diff = max - min
    const multipleOf = runFake(faker => faker.number.bigInt({ min: 1n, max: diff + 1n }))
    const schema = z.bigint().multipleOf(multipleOf).min(min).max(max)
    const faker = new ZodBigIntFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data).success).toBe(true)
  })
})
