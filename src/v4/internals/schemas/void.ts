import * as core from 'zod/v4/core'
import { Context } from '../context'
import { rootFake as internalFake } from '../fake'
import { Infer } from '../type'

export function fakeVoid<T extends core.$ZodVoid>(
  schema: T,
  context: Context,
  rootFake: typeof internalFake,
): Infer<T> {
  return undefined
}
