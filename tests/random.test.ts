import { describe, expect, test } from 'vitest'
import { z } from 'zod'
import { install, fake, seed, runFake, randexp } from '../src'
import { resetSeed } from '../src/random'

test('runFake', () => {
  const data = runFake(faker => faker.datatype.boolean())
  expect(data).toBeTypeOf('boolean')
})

test('randexp', () => {
  const regex = /^foo|bar$/
  const data = randexp(regex)
  expect(data).toBeTypeOf('string')
  expect(data).toMatch(regex)
})

describe('seed', () => {
  test('runFake', () => {
    seed(97)
    const data1 = runFake(faker => faker.number.int())
    const data2 = runFake(faker => faker.number.int())
    expect(data1).toBe(data2)

    resetSeed()
    const data3 = runFake(faker => faker.number.int())
    expect(data1).not.toBe(data3)
  })

  test('randexp', () => {
    seed(61)
    const re = /\d+/
    const data1 = randexp(re)
    const data2 = randexp(re)
    expect(data1).toBe(data2)

    resetSeed()
    const data3 = randexp(re)
    expect(data1).not.toBe(data3)
  })

  test('integration', () => {
    install()
    const schema = z.object({
      foo: z.number(),
      bar: z.number(),
      date: z.date(),
      string: z.object({
        date: z.string().date(),
        datetime: z.string().datetime(),
        time: z.string().time(),
      }),
    })

    seed(3)
    const data1 = fake(schema)
    seed(3)
    const data2 = fake(schema)
    expect(data1).toMatchSnapshot()
    expect(data1).toEqual(data2)

    const data3 = fake(schema)
    expect(data1).not.toEqual(data3)
  })
})

test('runFake can be used with sync functions', () => {
  expect(() => runFake(() => {})).not.toThrow()
})

test('runFake can not be used with async functions', () => {
  // @ts-expect-error
  expect(() => runFake(async () => {})).toThrow()
})
