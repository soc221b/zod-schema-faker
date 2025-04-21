import { rootFake } from './internals/fake'
import { ZodType } from './internals/type'

export function fake<T extends ZodType>(schema: T): T['_zod']['output'] {
  return rootFake(schema, { depth: 0 })
}
