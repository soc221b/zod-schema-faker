import { expect, test } from 'vitest'
import { z } from 'zod/v3'
import { install, fake } from '../../src/v3'
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
