import { expect, it } from 'vitest'
import * as mini from '@zod/mini'
import * as zod from 'zod'
import fake from '../src/fake'

it('works with @zod/mini', () => {
  const schema = mini.undefined()

  const result = fake(schema)

  expect(result).toBeUndefined()
})

it('works with zod', () => {
  const schema = zod.undefined()

  const result = fake(schema)

  expect(result).toBeUndefined()
})
