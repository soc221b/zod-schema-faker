import * as core from '@zod/core'
import { Context } from '../context'
import { rootFake as internalFake } from '../fake'
import { Infer } from '../type'

export function fakeUnknown<T extends core.$ZodUnknown>(
  schema: T,
  context: Context,
  rootFake: typeof internalFake,
): Infer<T> {
  return undefined
}
