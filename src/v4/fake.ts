import * as core from 'zod/v4/core'
import { rootFake } from './internals/fake'

export function fake<T extends core.$ZodType>(schema: T): core.infer<T> {
  return rootFake(schema, { depth: 0 })
}
