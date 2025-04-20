import * as core from '@zod/core'
import { Context } from '../context'
import { fake as internalFake } from '../fake'

export function fakeLazy<T extends core.$ZodLazy>(
  schema: T,
  fake: typeof internalFake,
  context: Context,
): core.infer<T> {
  return fake(schema._zod.def.getter(), { ...context, depth: context.depth + 1 })
}
