import { describe, expect, test } from 'vitest'
import * as z from 'zod'
import { zodObjectFaker, ZodObjectFaker } from '../src/zod-object-faker'
import { expectType, TypeEqual } from 'ts-expect'
import { install } from '../src'

test('ZodObjectFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => zodObjectFaker(invalidSchema)).toThrow()
})

test('ZodObjectFaker should accepts a ZodObject schema', () => {
  const schema = z.object({ foo: z.number(), bar: z.string() })
  expect(() => zodObjectFaker(schema)).not.toThrow()
})

test('ZodObjectFaker should return a ZodObjectFaker instance', () => {
  expect(typeof zodObjectFaker).toBe('function')

  const schema = z.object({ foo: z.number(), bar: z.string() })
  const faker = zodObjectFaker(schema)
  expect(faker instanceof ZodObjectFaker).toBe(true)
})

test('ZodObjectFaker.fake should be a function', () => {
  const schema = z.object({ foo: z.number(), bar: z.string() })
  const faker = zodObjectFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

describe('default', () => {
  test('ZodObjectFaker.fake should return object type', () => {
    const schema = z.object({ foo: z.number(), bar: z.string() })
    const faker = zodObjectFaker(schema)
    expectType<TypeEqual<ReturnType<typeof faker.fake>, { foo: number; bar: string }>>(true)
  })

  test('ZodObjectFaker.fake should return a valid data', () => {
    install()

    const schema = z.object({ foo: z.number(), bar: z.string() })
    const faker = zodObjectFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data).success).toBe(true)
  })
})

describe('passthrough', () => {
  test('ZodObjectFaker.fake should return object type', () => {
    const schema = z.object({ foo: z.number(), bar: z.string() }).passthrough()
    const faker = zodObjectFaker(schema)
    expectType<TypeEqual<ReturnType<typeof faker.fake>, { foo: number; bar: string } & { [k: string]: unknown }>>(true)
  })

  test('ZodObjectFaker.fake should return a valid data', () => {
    install()

    const schema = z.object({ foo: z.number(), bar: z.string() }).passthrough()
    const faker = zodObjectFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data).success).toBe(true)
  })
})

describe('strict', () => {
  test('ZodObjectFaker.fake should return object type', () => {
    const schema = z.object({ foo: z.number(), bar: z.string() }).strict()
    const faker = zodObjectFaker(schema)
    expectType<TypeEqual<ReturnType<typeof faker.fake>, { foo: number; bar: string }>>(true)
  })

  test('ZodObjectFaker.fake should return a valid data', () => {
    install()

    const schema = z.object({ foo: z.number(), bar: z.string() }).strict()
    const faker = zodObjectFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data).success).toBe(true)
  })
})

describe('catchall', () => {
  test('ZodObjectFaker.fake should return object type', () => {
    const schema = z.object({ foo: z.number(), bar: z.string() }).catchall(z.boolean())
    const faker = zodObjectFaker(schema)
    expectType<
      TypeEqual<
        ReturnType<typeof faker.fake>,
        { foo: number; bar: string } & {
          [k: string]: boolean
        }
      >
    >(true)
  })

  test('ZodObjectFaker.fake should return a valid data', () => {
    install()

    const schema = z.object({ foo: z.number(), bar: z.string() }).catchall(z.boolean())
    const faker = zodObjectFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data).success).toBe(true)
  })
})
