import * as core from '@zod/core'
import { Context } from '../context'
import { fake as internalFake } from '../fake'
import { Infer } from '../type'

export function fakeLazy<T extends core.$ZodLazy>(schema: T, context: Context, fake: typeof internalFake): Infer<T> {
  return fake(schema._zod.def.getter(), { ...context, depth: context.depth + 1 })
}
