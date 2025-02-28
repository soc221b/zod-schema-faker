import { describe, expect, test } from 'vitest'
import { z } from 'zod'
import { ZodBigIntFaker } from '../src/zod-bigint-faker'
import { expectType, TypeEqual } from 'ts-expect'
import { testMultipleTimes } from './util'
import { getFaker } from '../src'

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
    const min = getFaker().number.bigInt({ min: -1000n, max: 1000n })
    const max = getFaker().number.bigInt({ min, max: min + 1000n })
    const diff = max - min
    const multipleOf = getFaker().number.bigInt({ min: 1n, max: diff + 1n })
    const schema = z.bigint().multipleOf(multipleOf).min(min).max(max)
    const faker = new ZodBigIntFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data).success).toBe(true)
  })
})

describe('multiple checks of the same kind', () => {
  test('multiple min', () => {
    const schema = z.bigint().min(200n).min(300n).min(100n).max(300n)
    const faker = new ZodBigIntFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data).data).toBe(300n)
  })

  test('multiple max', () => {
    const schema = z.bigint().max(100n).max(300n).max(200n).min(100n)
    const faker = new ZodBigIntFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data).data).toBe(100n)
  })

  test('multiple multipleOf', () => {
    const schema = z.bigint().multipleOf(2n).multipleOf(3n).min(2n).max(6n)
    const faker = new ZodBigIntFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data).data).toBe(6n)
  })
})

describe('impossible case', () => {
  test('min > max', () => {
    const schema = z.bigint().min(100n).max(99n)
    const faker = new ZodBigIntFaker(schema)
    expect(() => faker.fake()).toThrow(RangeError)
  })

  test('min > max', () => {
    const schema = z.bigint().min(100n).max(99n)
    const faker = new ZodBigIntFaker(schema)
    expect(() => faker.fake()).toThrow(RangeError)
  })
})
