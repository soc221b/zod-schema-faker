import { expectType, TypeEqual } from 'ts-expect'
import { z } from 'zod'
import { fake, install } from 'zod-schema-faker'

const schema = z.number()

// enable tree shaking
if (process.env.NODE_ENV === 'development') {
  install()

  const data = fake(schema)

  console.log(data) // => -2556.9

  expectType<TypeEqual<typeof data, any>>(false)
  expectType<TypeEqual<typeof data, number>>(true)
}
