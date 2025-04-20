import * as core from '@zod/core'
import { Context } from '../context'
import { fake as internalFake } from '../fake'

export function fakeVoid<T extends core.$ZodVoid>(
  schema: T,
  fake: typeof internalFake,
  context: Context,
): core.infer<T> {
  return undefined
}
