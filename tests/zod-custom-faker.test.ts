import { beforeEach, expect, test } from 'vitest'
import { z } from 'zod'
import { fake, installCustom, ZodTypeFaker, runFake, install } from '../src'

// 1/5. define custom schema
const pxSchema = z.custom<`${number}px`>(val => {
  return typeof val === 'string' ? /^\d+px$/.test(val) : false
})

// 2/5. define custom faker
class ZodPxFaker extends ZodTypeFaker<typeof pxSchema> {
  fake(): `${number}px` {
    // you can use `runFake` to generate fake data
    return `${runFake(faker => faker.number.int({ min: 0 }))}px`
    // or use `randexp` if applicable
    // return randexp(/[1-9]\d+?px/) as `${number}px`
  }
}

beforeEach(() => {
  // 3/5. install basic faker
  install()
  // 4/5. install custom faker
  installCustom(pxSchema, ZodPxFaker)
})

test('basic', () => {
  // 5/5. use it
  const data = fake(pxSchema)

  expect(pxSchema.safeParse(data).success).toBe(true)
})

test('integration', () => {
  const schema = z
    .object({
      padding: pxSchema,
    })
    .strict()

  const data = fake(schema)

  expect(schema.safeParse(data).success).toBe(true)
})

test('type', () => {
  // @ts-expect-error
  installCustom(z.custom(), ZodTypeFaker)

  expect(true).toBe(true)
})
