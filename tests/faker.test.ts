import * as z from 'zod'
import { install, fake, seed } from '../src'

test('seed', () => {
  install()
  const schema = z.number()

  seed(1)
  const data1 = fake(schema)
  seed(1)
  const data2 = fake(schema)
  expect(data1).toBe(data2)

  const data3 = fake(schema)
  expect(data1).not.toBe(data3)
})
