import { expect, test } from 'vitest'
import { z } from 'zod'
import { fake, install } from '../src'

test('branded', () => {
  install()

  const Cat = z.object({ name: z.string() }).brand<'Cat'>()
  type Cat = z.infer<typeof Cat>

  const data = fake(Cat)

  expect(Cat.safeParse(data).success).toBe(true)

  const petCat = (cat: Cat) => {}
  petCat(data)
})
