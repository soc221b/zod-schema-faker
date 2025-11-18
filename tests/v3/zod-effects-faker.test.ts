import { expectType, TypeEqual } from 'ts-expect'
import { expect, test, vi } from 'vitest'
import { z } from 'zod/v3'
import { install } from '../../src/v3'
import { ZodEffectsFaker } from '../../src/v3/zod-effects-faker'

test('type', () => {
  install()
  const data = new ZodEffectsFaker(z.preprocess(val => String(val), z.string().min(5).max(10))).fake()
  expectType<TypeEqual<typeof data, string>>(true)
})

test('ZodEffectsFaker should return a ZodEffectsFaker instance', () => {
  const schema = z.preprocess(val => String(val), z.string().min(5).max(10))
  const faker = new ZodEffectsFaker(schema)
  expect(faker instanceof ZodEffectsFaker).toBe(true)
})

test('it should not throw error when schema has preprocess-effects', () => {
  install()
  const schema = z.string().min(5).max(10)
  const preprocess = z.preprocess(val => String(val), schema)
  const faker = new ZodEffectsFaker(preprocess)

  expect(() => faker.fake()).not.toThrow()

  const data = faker.fake()

  expect(schema.safeParse(data).success).toBe(true)
})

test('it should ignore preprocess-effects', () => {
  install()
  const fn = vi.fn()
  const schema = z.string().min(5).max(10)
  const preprocess = z.preprocess(fn, schema)
  const faker = new ZodEffectsFaker(preprocess)

  faker.fake()

  expect(fn).not.toHaveBeenCalled()
})

test('it should not throw error when schema has refine-effects', () => {
  install()
  const schema = z.string().refine(val => val.length <= 255, {
    message: "String can't be more than 255 characters",
  })
  const faker = new ZodEffectsFaker(schema)

  const act = () => faker.fake()

  expect(act).not.toThrow()
})

test('it should ignore refine-effects', () => {
  install()
  const fn = vi.fn()
  const schema = z.string().length(300).refine(fn, {
    message: "String can't be more than 255 characters",
  })
  const faker = new ZodEffectsFaker(schema)

  faker.fake()

  expect(fn).not.toHaveBeenCalled()
})

test('it should not throw error when schema has transform-effects', () => {
  install()
  const schema = z.string().transform(val => val.length)
  const faker = new ZodEffectsFaker(schema)

  const act = () => faker.fake()

  expect(act).not.toThrow()
})

test('it should execute transform-effects', () => {
  install()
  const schema = z.string().transform(val => val.length)
  const faker = new ZodEffectsFaker(schema)

  const data = faker.fake()

  expectType<TypeEqual<typeof data, number>>(true)
  expect(typeof data).toBe('number')
})
