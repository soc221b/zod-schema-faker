import { expectType, TypeEqual } from 'ts-expect'
import { describe, expect, test } from 'vitest'
import { z } from 'zod/v3'
import { install } from '../../src/v3'
import { ZodObjectFaker } from '../../src/v3/zod-object-faker'

test('ZodObjectFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => new ZodObjectFaker(invalidSchema)).toThrow()
})

test('ZodObjectFaker should accepts a ZodObject schema', () => {
  const schema = z.object({ foo: z.number(), bar: z.string() })
  expect(() => new ZodObjectFaker(schema)).not.toThrow()
})

test('ZodObjectFaker should return a ZodObjectFaker instance', () => {
  const schema = z.object({ foo: z.number(), bar: z.string() })
  const faker = new ZodObjectFaker(schema)
  expect(faker instanceof ZodObjectFaker).toBe(true)
})

test('ZodObjectFaker.fake should be a function', () => {
  const schema = z.object({ foo: z.number(), bar: z.string() })
  const faker = new ZodObjectFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

describe('default', () => {
  test('ZodObjectFaker.fake should return object type', () => {
    const schema = z.object({ foo: z.number(), bar: z.string() })
    const faker = new ZodObjectFaker(schema)
    expectType<TypeEqual<ReturnType<typeof faker.fake>, { foo: number; bar: string }>>(true)
  })

  test('ZodObjectFaker.fake should return a valid data', () => {
    install()

    const schema = z.object({ foo: z.number(), bar: z.string() })
    const faker = new ZodObjectFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data).success).toBe(true)
  })
})

describe('passthrough', () => {
  test('ZodObjectFaker.fake should return object type', () => {
    const schema = z.object({ foo: z.number(), bar: z.string() }).passthrough()
    const faker = new ZodObjectFaker(schema)
    expectType<TypeEqual<ReturnType<typeof faker.fake>, { foo: number; bar: string } & { [k: string]: unknown }>>(true)
  })

  test('ZodObjectFaker.fake should return a valid data', () => {
    install()

    const schema = z.object({ foo: z.number(), bar: z.string() }).passthrough()
    const faker = new ZodObjectFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data).success).toBe(true)
  })

  test('ZodObjectFaker.fake should sometimes return extra keys', () => {
    install()

    const schema = z.object({ foo: z.number(), bar: z.string() }).passthrough()
    const faker = new ZodObjectFaker(schema)
    while (true) {
      const data = faker.fake()
      if (Object.keys(data).length > 2) {
        return
      }
    }
  })
})

describe('strict', () => {
  test('ZodObjectFaker.fake should return object type', () => {
    const schema = z.object({ foo: z.number(), bar: z.string() }).strict()
    const faker = new ZodObjectFaker(schema)
    expectType<TypeEqual<ReturnType<typeof faker.fake>, { foo: number; bar: string }>>(true)
  })

  test('ZodObjectFaker.fake should return a valid data', () => {
    install()

    const schema = z.object({ foo: z.number(), bar: z.string() }).strict()
    const faker = new ZodObjectFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data).success).toBe(true)
  })
})

describe('catchall', () => {
  test('ZodObjectFaker.fake should return object type', () => {
    const schema = z.object({ foo: z.number(), bar: z.string() }).catchall(z.boolean())
    const faker = new ZodObjectFaker(schema)
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
    const faker = new ZodObjectFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data).success).toBe(true)
  })
})
