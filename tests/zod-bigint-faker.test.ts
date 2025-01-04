import { describe, expect, test } from 'vitest'
import { z } from 'zod'
import { zodBigIntFaker, ZodBigIntFaker } from '../src/zod-bigint-faker'
import { expectType, TypeEqual } from 'ts-expect'
import { testMultipleTimes } from './util'

test('ZodBigIntFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => zodBigIntFaker(invalidSchema)).toThrow()
})

test('ZodBigIntFaker should accepts a ZodBigInt schema', () => {
  const schema = z.bigint()
  expect(() => zodBigIntFaker(schema)).not.toThrow()
})

test('ZodBigIntFaker should return a ZodBigIntFaker instance', () => {
  expect(typeof zodBigIntFaker).toBe('function')
  const schema = z.bigint()
  const faker = zodBigIntFaker(schema)
  expect(faker instanceof ZodBigIntFaker).toBe(true)
})

test('ZodBigIntFaker.fake should be a function', () => {
  const schema = z.bigint()
  const faker = zodBigIntFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodBigIntFaker.fake should return bigint type', () => {
  const schema = z.bigint()
  const faker = zodBigIntFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, bigint>>(true)
})

test('ZodBigIntFaker.fake should return a valid data', () => {
  const schema = z.bigint()
  const faker = zodBigIntFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('gt', () => {
  const schema = z.bigint().gt(100n)
  const faker = zodBigIntFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('gte', () => {
  const schema = z.bigint().gte(100n)
  const faker = zodBigIntFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('lt', () => {
  const schema = z.bigint().lt(100n)
  const faker = zodBigIntFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('lte', () => {
  const schema = z.bigint().lte(100n)
  const faker = zodBigIntFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('positive', () => {
  const schema = z.bigint().positive()
  const faker = zodBigIntFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('nonnegative', () => {
  const schema = z.bigint().nonnegative()
  const faker = zodBigIntFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('negative', () => {
  const schema = z.bigint().negative()
  const faker = zodBigIntFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('nonpositive', () => {
  const schema = z.bigint().nonpositive()
  const faker = zodBigIntFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

testMultipleTimes('multiplyOf', () => {
  const schema = z.bigint().multipleOf(37n)
  const faker = zodBigIntFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

testMultipleTimes('multiplyOf 1', () => {
  const schema = z.bigint().multipleOf(37n).min(74n).max(74n)
  const faker = zodBigIntFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

testMultipleTimes('multiplyOf 2', () => {
  const schema = z.bigint().multipleOf(37n).min(-74n).max(-74n)
  const faker = zodBigIntFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

testMultipleTimes('multiplyOf 3', () => {
  const schema = z.bigint().multipleOf(-37n).min(74n).max(74n)
  const faker = zodBigIntFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

testMultipleTimes('multiplyOf 4', () => {
  const schema = z.bigint().multipleOf(-37n).min(-74n).max(-74n)
  const faker = zodBigIntFaker(schema)
  const data = faker.fake()
  if (schema.safeParse(data).success === false) {
    console.log(data)
  }
  expect(schema.safeParse(data).success).toBe(true)
})

describe('edge case', () => {
  test('gt', () => {
    const schema = z.bigint().gt(100n).lte(101n)
    const faker = zodBigIntFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data).success).toBe(true)
    expect(data).toBe(101n)
  })

  test('gte', () => {
    const schema = z.bigint().gte(100n).lt(101n)
    const faker = zodBigIntFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data).success).toBe(true)
    expect(data).toBe(100n)
  })

  test('lt', () => {
    const schema = z.bigint().lt(100n).gte(99n)
    const faker = zodBigIntFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data).success).toBe(true)
    expect(data).toBe(99n)
  })

  test('lte', () => {
    const schema = z.bigint().lte(100n).gt(99n)
    const faker = zodBigIntFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data).success).toBe(true)
    expect(data).toBe(100n)
  })

  test('positive', () => {
    const schema = z.bigint().positive().lt(2n)
    const faker = zodBigIntFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data).success).toBe(true)
    expect(data).toBe(1n)
  })

  test('nonnegative', () => {
    const schema = z.bigint().nonnegative().lt(1n)
    const faker = zodBigIntFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data).success).toBe(true)
    expect(data).toBe(0n)
  })

  test('negative', () => {
    const schema = z.bigint().negative().gt(-2n)
    const faker = zodBigIntFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data).success).toBe(true)
    expect(data).toBe(-1n)
  })

  test('nonpositive', () => {
    const schema = z.bigint().nonpositive().gt(-1n)
    const faker = zodBigIntFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data).success).toBe(true)
    expect(data).toBe(0n)
  })

  test('multiplyOf positive', () => {
    const schema = z.bigint().multipleOf(37n).gte(37n).lte(37n)
    const faker = zodBigIntFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data).success).toBe(true)
    expect(data).toBe(37n)
  })

  test('multiplyOf negative', () => {
    const schema = z.bigint().multipleOf(-37n).gte(-37n).lte(-37n)
    const faker = zodBigIntFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data).success).toBe(true)
    expect(data).toBe(-37n)
  })

  test('multiplyOf + min', () => {
    const schema = z.bigint().multipleOf(37n).min(37n)
    const faker = zodBigIntFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data).success).toBe(true)
  })

  test('multiplyOf + max', () => {
    const schema = z.bigint().multipleOf(37n).max(37n)
    const faker = zodBigIntFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data).success).toBe(true)
  })

  test('multiplyOf', () => {
    for (let i = 0n; i < 2000n; i++) {
      const schema = z
        .bigint()
        .multipleOf(37n)
        .min(i)
        .max(i + 37n)
      const faker = zodBigIntFaker(schema)
      const data = faker.fake()
      expect(schema.safeParse(data).success).toBe(true)
    }
    for (let i = 0n; i > -2000n; i--) {
      const schema = z
        .bigint()
        .multipleOf(37n)
        .min(i - 37n)
        .max(i)
      const faker = zodBigIntFaker(schema)
      const data = faker.fake()
      expect(schema.safeParse(data).success).toBe(true)
    }
    for (let i = 0n; i < 2000n; i++) {
      const schema = z
        .bigint()
        .multipleOf(-37n)
        .min(i)
        .max(i + 37n)
      const faker = zodBigIntFaker(schema)
      const data = faker.fake()
      expect(schema.safeParse(data).success).toBe(true)
    }
    for (let i = 0n; i > -2000n; i--) {
      const schema = z
        .bigint()
        .multipleOf(-37n)
        .min(i - 37n)
        .max(i)
      const faker = zodBigIntFaker(schema)
      const data = faker.fake()
      expect(schema.safeParse(data).success).toBe(true)
    }
  })
})
