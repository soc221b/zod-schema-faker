import * as z from 'zod'
import { fake, installCustom, ZodTypeFaker, runFake, install } from '../src'

const pxSchema = z.custom<`${number}px`>(val => {
  return typeof val === 'string' ? /^\d+px$/.test(val) : false
})
class pxFaker extends ZodTypeFaker<typeof pxSchema> {
  fake(): `${number}px` {
    return `${runFake(faker => faker.number.int({ min: 0 }))}px`
  }
}

beforeEach(() => {
  install()
  installCustom(pxSchema, pxFaker)
})

test('basic', () => {
  const data = fake(pxSchema)

  expect(pxSchema.safeParse(data).success).toBe(true)
})

test('used with other schemas', () => {
  const schema = z
    .object({
      padding: pxSchema,
    })
    .strict()

  const data = fake(schema)

  expect(schema.safeParse(data).success).toBe(true)
})
