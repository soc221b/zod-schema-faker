import * as core from '@zod/core'
import { Context } from '../context'
import { fake as internalFake } from '../fake'
import { Infer } from '../type'

export function fakeSymbol<T extends core.$ZodSymbol>(
  schema: T,
  fake: typeof internalFake,
  context: Context,
): Infer<T> {
  return Symbol()
}
