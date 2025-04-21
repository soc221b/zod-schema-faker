import * as core from '@zod/core'
import { Context } from '../context'
import { fake as internalFake } from '../fake'
import { Infer } from '../type'

export function fakeLazy<T extends core.$ZodLazy>(schema: T, fake: typeof internalFake, context: Context): Infer<T> {
  return fake(schema._zod.def.getter(), { ...context, depth: context.depth + 1 })
}
