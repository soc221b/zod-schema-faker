import { fake as internalFake } from './internals/fake'
import { ZodType } from './internals/type'

export function fake<T extends ZodType>(schema: T): T['_zod']['output'] {
  return internalFake(schema as any, { depth: 0 })
}
