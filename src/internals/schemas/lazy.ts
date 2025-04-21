import * as core from '@zod/core'
import { Context } from '../context'
import { rootFake as internalFake } from '../fake'
import { Infer } from '../type'

export function fakeLazy<T extends core.$ZodLazy>(
  schema: T,
  context: Context,
  rootFake: typeof internalFake,
): Infer<T> {
  return rootFake(schema._zod.def.getter(), { ...context, depth: context.depth + 1 })
}
