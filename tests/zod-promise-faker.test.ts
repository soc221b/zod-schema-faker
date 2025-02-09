import { afterEach, beforeEach, expect, test, vitest } from 'vitest'
import { z } from 'zod'
import { ZodPromiseFaker } from '../src/zod-promise-faker'
import { expectType, TypeEqual } from 'ts-expect'
import { install } from '../src'

beforeEach(() => {
  vitest.useFakeTimers()
})

afterEach(() => {
  vitest.useRealTimers()
})

test('ZodPromiseFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => new ZodPromiseFaker(invalidSchema)).toThrow()
})

test('ZodPromiseFaker should accepts a ZodPromise schema', () => {
  const schema = z.promise(z.string())
  expect(() => new ZodPromiseFaker(schema)).not.toThrow()
})

test('ZodPromiseFaker should return a ZodPromiseFaker instance', () => {
  const schema = z.promise(z.string())
  const faker = new ZodPromiseFaker(schema)
  expect(faker instanceof ZodPromiseFaker).toBe(true)
})

test('ZodPromiseFaker.fake should be a function', () => {
  const schema = z.promise(z.string())
  const faker = new ZodPromiseFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodPromiseFaker.fake should return promise type', () => {
  const schema = z.promise(z.string())
  const faker = new ZodPromiseFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, Promise<string>>>(true)
})

test('ZodPromiseFaker.fake should return a valid data', async () => {
  install()

  const schema = z.promise(z.string())
  const faker = new ZodPromiseFaker(schema)
  const data = faker.fake()
  vitest.runAllTimers()
  expect((await schema.safeParseAsync(data)).success).toBe(true)
})

test('microtask', async () => {
  install()
  const schema = z.promise(z.string())
  const faker = new ZodPromiseFaker(schema)

  while (true) {
    let data
    faker.fake().then(_data => {
      data = _data
    })
    const micro = Promise.resolve()
    vitest.runAllTicks()
    await micro
    if (typeof data === 'string') {
      return
    }
  }
})

test('task', async () => {
  install()
  const schema = z.promise(z.string())
  const faker = new ZodPromiseFaker(schema)

  while (true) {
    let data
    faker.fake().then(_data => {
      data = _data
    })
    const micro = Promise.resolve()
    const macro = new Promise(resolve => setTimeout(resolve))
    vitest.runAllTicks()
    await micro
    if (typeof data === 'string') {
      continue
    }
    await vitest.advanceTimersByTime(0)
    await macro
    if (typeof data === 'string') {
      return
    }
  }
})
