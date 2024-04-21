import * as z from 'zod'
import { install, fake } from '../src'
import { expectType, TypeEqual } from 'ts-expect'

test('pipe', () => {
  const _in = z.string().transform(val => val.length)
  const out = z.number().min(5).int()
  const schema = _in.pipe(out)

  install()
  const data = fake(schema)

  expectType<TypeEqual<typeof data, number>>(true)
  expect(out.safeParse(data).success).toBe(true)
})
