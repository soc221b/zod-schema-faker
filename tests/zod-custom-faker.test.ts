import * as z from 'zod'
import { fake, installCustom, ZodTypeFaker, runFake, install } from '../src'

// 1. define custom schema
const pxSchema = z.custom<`${number}px`>(val => {
  return typeof val === 'string' ? /^\d+px$/.test(val) : false
})

// 2. define custom faker
class pxFaker extends ZodTypeFaker<typeof pxSchema> {
  fake(): `${number}px` {
    // you can use `runFake` to generate fake data, or
    return `${runFake(faker => faker.number.int({ min: 0 }))}px`
    // or use `randexp` if applicable
    // return randexp(/[1-9]\d+?px/) as `${number}px`
  }
}

beforeEach(() => {
  // 3. install basic faker
  install()
  // 4. install custom faker
  installCustom(pxSchema, pxFaker)
})

test('basic', () => {
  // 5. use it
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
