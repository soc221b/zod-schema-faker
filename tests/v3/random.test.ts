import { describe, expect, test, vi } from 'vitest'
import { z } from 'zod/v3'
import { install, fake, seed, getFaker, randexp, setFaker, runFake, installFaker } from '../../src/v3'
import { fakerAR, fakerEN, fakerJA } from '@faker-js/faker'

describe('@faker-js/faker', () => {
  test('default', () => {
    const spy = vi.spyOn(fakerEN.lorem, 'word')

    const data = getFaker().lorem.word()
    expect(data).toBeTypeOf('string')
    expect(spy).toHaveBeenCalled()

    spy.mockReset()

    const data2 = runFake(faker => faker.lorem.word())
    expect(data2).toBeTypeOf('string')
    expect(spy).toHaveBeenCalled()
  })

  test('custom', () => {
    const spyJA = vi.spyOn(fakerJA.lorem, 'word')
    setFaker(fakerJA)
    const data = getFaker().lorem.word()
    expect(data).toBeTypeOf('string')
    expect(spyJA).toHaveBeenCalled()

    const spyAR = vi.spyOn(fakerAR.lorem, 'word')
    installFaker(fakerAR)
    const data2 = runFake(faker => faker.lorem.word())
    expect(data2).toBeTypeOf('string')
    expect(spyAR).toHaveBeenCalled()
  })

  test('runFake can not be used with async functions', () => {
    // @ts-expect-error
    expect(() => runFake(async () => {})).toThrow()
  })
})

describe('randexp', () => {
  test('randexp', () => {
    const regex = /^foo|bar$/
    const data = randexp(regex)
    expect(data).toBeTypeOf('string')
    expect(data).toMatch(regex)
  })
})

describe('seed', () => {
  test('getFaker', () => {
    const gen = () => getFaker().number.int()

    seed(97)
    const data1 = gen()
    expect(data1).toMatchInlineSnapshot(`7538522492335270`)

    seed(97)
    const data2 = gen()
    expect(data1).toBe(data2)

    const data3 = gen()
    expect(data1).not.toBe(data3)
  })

  test('randexp', () => {
    const gen = () => randexp(/\d{50}/)

    seed(61)
    const data1 = gen()
    expect(data1).toMatchInlineSnapshot(`"81849096331484486007704357152196940134457972127416"`)

    seed(61)
    const data2 = gen()
    expect(data1).toBe(data2)

    const data3 = gen()
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
    const gen = () => fake(schema)

    seed(3)
    const data1 = gen()
    expect(data1).toMatchInlineSnapshot(`
      {
        "bar": 7138981630600537,
        "date": -271821-05-08T18:51:09.723Z,
        "foo": -3766725359666402,
        "string": {
          "date": "4408-02-05",
          "datetime": "0298-10-05T14:52:06.368Z",
          "time": "02:09:02",
        },
      }
    `)

    seed(3)
    const data2 = gen()
    expect(data1).toEqual(data2)

    const data3 = gen()
    expect(data1).not.toEqual(data3)
  })
})
