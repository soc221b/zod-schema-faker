import { faker } from '@faker-js/faker'
import { expectType, TypeEqual } from 'ts-expect'
import { z } from 'zod'
import { fake, setFaker } from 'zod-schema-faker'

const schema = z.number()

// enable tree shaking
if (process.env.NODE_ENV === 'development') {
  setFaker(faker)
  const data = fake(schema)

  console.log(data) // => -2556.9

  expectType<TypeEqual<typeof data, any>>(false)
  expectType<TypeEqual<typeof data, number>>(true)
}
