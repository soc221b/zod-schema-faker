import { expect, test } from 'vitest'
import { z } from 'zod'
import { ZodStringFaker } from '../src/zod-string-faker'
import { expectType, TypeEqual } from 'ts-expect'
import { testMultipleTimes } from './util'

test('ZodStringFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => new ZodStringFaker(invalidSchema)).toThrow()
})

test('ZodStringFaker should accepts a ZodString schema', () => {
  const schema = z.string()
  expect(() => new ZodStringFaker(schema)).not.toThrow()
})

test('ZodStringFaker should return a ZodStringFaker instance', () => {
  const schema = z.string()
  const faker = new ZodStringFaker(schema)
  expect(faker instanceof ZodStringFaker).toBe(true)
})

test('ZodStringFaker.fake should be a function', () => {
  const schema = z.string()
  const faker = new ZodStringFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodStringFaker.fake should return string type', () => {
  const schema = z.string()
  const faker = new ZodStringFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, string>>(true)
})

test('ZodStringFaker.fake should return a valid data', () => {
  const schema = z.string()
  const faker = new ZodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('base64', () => {
  const schema = z.string().base64()
  const faker = new ZodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('base64url', () => {
  const schema = z.string().base64url()
  const faker = new ZodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('cidr', () => {
  const schema = z.string().cidr()
  const faker = new ZodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('cidr should sometimes return v4', () => {
  const schema = z.string().cidr()
  const v4 = schema.cidr({ version: 'v4' })
  const faker = new ZodStringFaker(schema)
  let safeCount = 0
  while (++safeCount < 100) {
    const data = faker.fake()
    if (v4.safeParse(data).success) {
      return
    }
  }
  expect.unreachable()
})

test('cidr should sometimes return v6', () => {
  const schema = z.string().cidr()
  const v6 = schema.cidr({ version: 'v6' })
  const faker = new ZodStringFaker(schema)
  let safeCount = 0
  while (++safeCount < 100) {
    const data = faker.fake()
    if (v6.safeParse(data).success) {
      return
    }
  }
  expect.unreachable()
})

test('cidr v4', () => {
  const schema = z.string().cidr({ version: 'v4' })
  const faker = new ZodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('cidr v6', () => {
  const schema = z.string().cidr({ version: 'v6' })
  const faker = new ZodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('cuid', () => {
  const schema = z.string().cuid()
  const faker = new ZodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('cuid2', () => {
  const schema = z.string().cuid2()
  const faker = new ZodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('date', () => {
  const schema = z.string().date()
  const faker = new ZodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('datetime', () => {
  const schema = z.string().datetime()
  const faker = new ZodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('duration', () => {
  const schema = z.string().duration()
  const faker = new ZodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('duration should sometimes include years', () => {
  const schema = z.string().duration()
  const faker = new ZodStringFaker(schema)
  while (true) {
    const data = faker.fake()
    if (data.includes('Y')) {
      return
    }
  }
})

test('duration should sometimes include months', () => {
  const schema = z.string().duration()
  const faker = new ZodStringFaker(schema)
  while (true) {
    const data = faker.fake()
    if (data.includes('M')) {
      return
    }
  }
})

test('duration should sometimes include days', () => {
  const schema = z.string().duration()
  const faker = new ZodStringFaker(schema)
  while (true) {
    const data = faker.fake()
    if (data.includes('D')) {
      return
    }
  }
})

test('duration should sometimes include hours', () => {
  const schema = z.string().duration()
  const faker = new ZodStringFaker(schema)
  while (true) {
    const data = faker.fake()
    if (data.includes('H')) {
      return
    }
  }
})

test('duration should sometimes include minutes', () => {
  const schema = z.string().duration()
  const faker = new ZodStringFaker(schema)
  while (true) {
    const data = faker.fake()
    if (/T.*\d+M/.test(data)) {
      return
    }
  }
})

test('duration should sometimes include seconds', () => {
  const schema = z.string().duration()
  const faker = new ZodStringFaker(schema)
  while (true) {
    const data = faker.fake()
    if (data.includes('S')) {
      return
    }
  }
})

test('email', () => {
  const schema = z.string().email()
  const faker = new ZodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

testMultipleTimes('emoji', () => {
  const schema = z.string().emoji()
  const faker = new ZodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('endsWith', () => {
  const schema = z.string().endsWith('ABC')
  const faker = new ZodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('includes', () => {
  const schema = z.string().includes('ABC')
  const faker = new ZodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('ip', () => {
  const schema = z.string().ip()
  const faker = new ZodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('ip v4', () => {
  const schema = z.string().ip({ version: 'v4' })
  const faker = new ZodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('ip v6', () => {
  const schema = z.string().ip({ version: 'v6' })
  const faker = new ZodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('jwt', () => {
  const schema = z.string().jwt()
  const faker = new ZodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('length', () => {
  const schema = z.string().length(5)
  const faker = new ZodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('max', () => {
  const schema = z.string().max(5)
  const faker = new ZodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('min', () => {
  const schema = z.string().min(100)
  const faker = new ZodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('nanoid', () => {
  const schema = z.string().nanoid()
  const faker = new ZodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('regex', () => {
  const schema = z.string().regex(/hello+ (world|to you)/)
  const faker = new ZodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('startsWith', () => {
  const schema = z.string().startsWith('ABC')
  const faker = new ZodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('time', () => {
  const schema = z.string().time()
  const faker = new ZodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('toLowerCase', () => {
  const schema = z.string().toLowerCase()
  const faker = new ZodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('toUpperCase', () => {
  const schema = z.string().toUpperCase()
  const faker = new ZodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('trim', () => {
  const schema = z.string().trim()
  const faker = new ZodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('ulid', () => {
  const schema = z.string().ulid()
  const faker = new ZodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('url', () => {
  const schema = z.string().url()
  const faker = new ZodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('uuid', () => {
  const schema = z.string().uuid()
  const faker = new ZodStringFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})
