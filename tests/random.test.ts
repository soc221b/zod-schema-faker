import { describe, expect, it } from 'vitest'
import { Faker } from '@faker-js/faker'
import { getFaker, randexp, seed, setFaker } from '../src/internals/random'
import * as z from 'zod'
import { fake } from '../src'

describe('@faker-js/faker', () => {
  it('does not have a default faker', () => {
    const faker = getFaker()

    expect(faker).toBeUndefined()
  })

  it('can set a faker', () => {
    const faker = new Faker({ locale: {} })

    setFaker(faker)

    expect(getFaker()).toEqual(faker)
  })
})

describe('randexp', () => {
  it('should works', () => {
    const regex = /^foo|bar$/
    const data = randexp(regex)
    expect(data).toBeTypeOf('string')
    expect(data).toMatch(regex)
  })
})

describe('seed', () => {
  it('should set seed for getFaker', () => {
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

  it('should set seed for randexp', () => {
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

  it.skip('should works together', () => {
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
