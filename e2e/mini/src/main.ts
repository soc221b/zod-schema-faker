import { z } from '@zod/mini'
import { faker } from '@faker-js/faker'
import { fake, setFaker } from 'zod-schema-faker'
import { expectType, TypeEqual } from 'ts-expect'

const schema = z.nullable(z.optional(z.string()))

// enable tree shaking
if (process.env.NODE_ENV === 'development') {
  setFaker(faker)
  const data = fake(schema)

  console.log(data)

  expectType<TypeEqual<typeof data, any>>(false)
  expectType<TypeEqual<typeof data, undefined | null | string>>(true)
}
