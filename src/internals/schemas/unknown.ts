import * as core from '@zod/core'
import { Context } from '../context'
import { fake as internalFake } from '../fake'
import { Infer } from '../type'

export function fakeUnknown<T extends core.$ZodUnknown>(
  schema: T,
  fake: typeof internalFake,
  context: Context,
): Infer<T> {
  return undefined
}
