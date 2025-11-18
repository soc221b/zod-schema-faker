import { expectType, TypeEqual } from 'ts-expect'
import { expect, test } from 'vitest'
import { z } from 'zod/v3'
import { fake, install } from '../../src/v3'

test('pipe', () => {
  const _in = z.string().transform(val => val.length)
  const out = z.number().min(5).int()
  const schema = _in.pipe(out)

  install()
  const data = fake(schema)

  expectType<TypeEqual<typeof data, number>>(true)
  expect(out.safeParse(data).success).toBe(true)
})
