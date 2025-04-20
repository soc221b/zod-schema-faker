import * as core from '@zod/core'
import { Context } from '../context'
import { fake as internalFake } from '../fake'

export function fakeSymbol<T extends core.$ZodSymbol>(
  schema: T,
  fake: typeof internalFake,
  context: Context,
): core.infer<T> {
  return Symbol()
}
