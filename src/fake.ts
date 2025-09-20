import * as core from 'zod/v4/core'
import { rootFake } from './internals/fake'

export function fake<T extends core.$ZodType>(schema: T): T['_zod']['output'] {
  return rootFake(schema, { depth: 0 })
}
