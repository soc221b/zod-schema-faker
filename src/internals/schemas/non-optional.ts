import * as core from '@zod/core'
import { Context } from '../context'
import { rootFake as internalFake } from '../fake'
import { Infer } from '../type'

export function fakeNonOptional<T extends core.$ZodNonOptional>(
  schema: T,
  context: Context,
  rootFake: typeof internalFake,
): Infer<T> {
  return rootFake(schema._zod.def.innerType, context)
}
