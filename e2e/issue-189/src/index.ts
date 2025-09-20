import { faker } from '@faker-js/faker'
import { expectType, TypeEqual } from 'ts-expect'
import { z } from 'zod'
import { fake, setFaker } from 'zod-schema-faker'

const Player = z.object({
  username: z.string(),
  xp: z.number(),
})

// enable tree shaking
if (process.env.NODE_ENV === 'development') {
  setFaker(faker)
  const data = fake(Player)
  console.log(data) // { username: "billie", xp: 100 }

  expectType<TypeEqual<typeof data, any>>(false)
  expectType<TypeEqual<typeof data, { username: string; xp: number }>>(true)
}
