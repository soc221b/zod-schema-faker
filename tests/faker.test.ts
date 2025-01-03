import { expect, test } from 'vitest'
import * as z from 'zod'
import { install, fake, seed } from '../src'
import { runFake } from '../src/faker'

test('seed', () => {
  install()
  const schema = z.object({ foo: z.number(), bar: z.number() })

  seed(3)
  const data1 = fake(schema)
  seed(3)
  const data2 = fake(schema)
  expect(data1).toMatchSnapshot()
  expect(data1).toEqual(data2)

  const data3 = fake(schema)
  expect(data1).not.toEqual(data3)
})

test('runFake can be used with sync functions', () => {
  expect(() => runFake(() => {})).not.toThrow()
})

test('runFake can not be used with async functions', () => {
  // @ts-expect-error
  expect(() => runFake(async () => {})).toThrow()
})
