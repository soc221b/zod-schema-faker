import * as z from 'zod'
import { install, fake, seed } from '../src'
import { runFake } from '../src/faker'

test('seed', () => {
  install()
  const schema = z.number()

  seed(3)
  const data1 = fake(schema)
  seed(3)
  const data2 = fake(schema)
  expect(data1).toBe(data2)

  const data3 = fake(schema)
  expect(data1).not.toBe(data3)
})

test('runFake can not be used with async functions', () => {
  expect(() => runFake(async () => {})).toThrow()
})
