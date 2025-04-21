import * as core from '@zod/core'
import { Context } from '../context'
import { rootFake as internalFake } from '../fake'
import { Infer } from '../type'

export function fakeSymbol<T extends core.$ZodSymbol>(
  schema: T,
  context: Context,
  rootFake: typeof internalFake,
): Infer<T> {
  return Symbol()
}
