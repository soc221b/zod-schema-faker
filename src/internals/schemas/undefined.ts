import * as core from '@zod/core'
import { Context } from '../context'
import { fake as internalFake } from '../fake'

export function fakeUndefined<T extends core.$ZodUndefined>(
  schema: T,
  fake: typeof internalFake,
  context: Context,
): core.infer<T> {
  return undefined
}
