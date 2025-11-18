import * as core from 'zod/v4/core'
import { Context } from '../context'
import { rootFake as internalFake } from '../fake'
import { Infer } from '../type'

export function fakeUndefined<T extends core.$ZodUndefined>(
  schema: T,
  context: Context,
  rootFake: typeof internalFake,
): Infer<T> {
  return undefined
}
