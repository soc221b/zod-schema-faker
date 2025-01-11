import { expect, test } from 'vitest'
import { z } from 'zod'
import { ZodNativeEnumFaker } from '../src/zod-native-enum-faker'
import { expectType, TypeEqual } from 'ts-expect'
import { install } from '../src'

enum NativeEnum {
  Foo,
  Bar,
  Baz = 'baz',
  Qux = 'qux',
}

test('ZodNativeEnumFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => new ZodNativeEnumFaker(invalidSchema)).toThrow()
})

test('ZodNativeEnumFaker should accepts a ZodNativeEnum schema', () => {
  const schema = z.nativeEnum(NativeEnum)
  expect(() => new ZodNativeEnumFaker(schema)).not.toThrow()
})

test('ZodNativeEnumFaker should return a ZodNativeEnumFaker instance', () => {
  const schema = z.nativeEnum(NativeEnum)
  const faker = new ZodNativeEnumFaker(schema)
  expect(faker instanceof ZodNativeEnumFaker).toBe(true)
})

test('ZodNativeEnumFaker.fake should be a function', () => {
  const schema = z.nativeEnum(NativeEnum)
  const faker = new ZodNativeEnumFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

test('ZodNativeEnumFaker.fake should return the give type', () => {
  const schema = z.nativeEnum(NativeEnum)
  const faker = new ZodNativeEnumFaker(schema)
  expectType<TypeEqual<ReturnType<typeof faker.fake>, NativeEnum>>(false)
})

test('ZodNativeEnumFaker.fake should return a valid data', () => {
  install()

  const schema = z.nativeEnum(NativeEnum)
  const faker = new ZodNativeEnumFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('numeric enums', () => {
  enum Fruits {
    Apple,
    Banana,
  }
  const schema = z.nativeEnum(Fruits)
  const faker = new ZodNativeEnumFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('string enums', () => {
  enum Fruits {
    Cantaloupe, // you can mix numerical and string enums
    Apple = 'apple',
    Banana = 'banana',
  }
  const schema = z.nativeEnum(Fruits)
  const faker = new ZodNativeEnumFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})

test('const enums', () => {
  const Fruits = {
    Apple: 'apple',
    Banana: 'banana',
    Cantaloupe: 3,
  } as const

  const schema = z.nativeEnum(Fruits)
  const faker = new ZodNativeEnumFaker(schema)
  const data = faker.fake()
  expect(schema.safeParse(data).success).toBe(true)
})
