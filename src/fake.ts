import { fake as internalFake } from './internals/fake'

type ZodType = { _zod: { output: unknown } }

export function fake<T extends ZodType>(schema: T): T['_zod']['output'] {
  return internalFake(schema as any, { depth: 0 })
}
