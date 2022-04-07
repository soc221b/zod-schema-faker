import * as z from 'zod'
import { zodTupleFaker, ZodTupleFaker } from '../src/zod-tuple-faker'
import { expectType, TypeEqual } from 'ts-expect'
import { install } from '../src'

test('ZodTupleFaker should assert parameters', () => {
  const invalidSchema = void 0 as any
  expect(() => zodTupleFaker(invalidSchema)).toThrow()
})

test('ZodTupleFaker should accepts a ZodTuple schema', () => {
  const schema = z.tuple([z.number(), z.string()]).rest(z.boolean())
  expect(() => zodTupleFaker(schema)).not.toThrow()
})

test('zodTupleFaker should return a ZodTupleFaker instance', () => {
  expect(typeof zodTupleFaker).toBe('function')
  const schema = z.tuple([z.number(), z.string()]).rest(z.boolean())
  const faker = zodTupleFaker(schema)
  expect(faker instanceof ZodTupleFaker).toBe(true)
})

test('ZodTupleFaker.fake should be a function', () => {
  const schema = z.tuple([z.number(), z.string()]).rest(z.boolean())
  const faker = zodTupleFaker(schema)
  expect(typeof faker.fake).toBe('function')
})

describe('without rest', () => {
  test('ZodTupleFaker.fake should return tuple type', () => {
    const faker = zodTupleFaker(z.tuple([z.number(), z.string()]))
    expectType<TypeEqual<ReturnType<typeof faker.fake>['0'], number>>(true)
    expectType<TypeEqual<ReturnType<typeof faker.fake>['1'], string>>(true)
  })

  test('ZodTupleFaker.fake should return a valid data', () => {
    install()

    const schema = z.tuple([z.number(), z.string()])
    const faker = zodTupleFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data).success).toBe(true)
  })
})

describe('rest', () => {
  test('ZodTupleFaker.fake should return tuple type', () => {
    const schema = z.tuple([z.number(), z.string()]).rest(z.boolean())
    const faker = zodTupleFaker(schema)
    expectType<TypeEqual<ReturnType<typeof faker.fake>, [number, string, ...boolean[]]>>(true)
  })

  test('ZodTupleFaker.fake should return a valid data', () => {
    install()

    const schema = z.tuple([z.number(), z.string()]).rest(z.boolean())
    const faker = zodTupleFaker(schema)
    const data = faker.fake()
    expect(schema.safeParse(data).success).toBe(true)
  })
})
