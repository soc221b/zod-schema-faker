import * as z from 'zod'
import { install, fake } from '../src'
import { expectType, TypeEqual } from 'ts-expect'

test('freeze', () => {
  const schema = z.object({ key: z.string() }).readonly()

  install()
  const data = fake(schema)

  expect(() => {
    // @ts-expect-error
    data.key = ''
  }).toThrow()
})

test('object', () => {
  const schema = z.object({ key: z.string() }).readonly()

  install()
  const data = fake(schema)

  expectType<TypeEqual<typeof data, { readonly key: string }>>(true)
  expect(schema.safeParse(data).success).toBe(true)
})

test('array', () => {
  const schema = z.array(z.string()).readonly()

  install()
  const data = fake(schema)

  expectType<TypeEqual<typeof data, ReadonlyArray<string>>>(true)
  expect(schema.safeParse(data).success).toBe(true)
})

test('tuple', () => {
  const schema = z.tuple([z.string(), z.number()]).readonly()

  install()
  const data = fake(schema)

  expectType<TypeEqual<typeof data, readonly [string, number]>>(true)
  expect(schema.safeParse(data).success).toBe(true)
})

test('map', () => {
  const schema = z.map(z.string(), z.date()).readonly()

  install()
  const data = fake(schema)

  expectType<TypeEqual<typeof data, ReadonlyMap<string, Date>>>(true)
  expect(schema.safeParse(data).success).toBe(true)
})

test('set', () => {
  const schema = z.set(z.string()).readonly()

  install()
  const data = fake(schema)

  expectType<TypeEqual<typeof data, ReadonlySet<string>>>(true)
  expect(schema.safeParse(data).success).toBe(true)
})
