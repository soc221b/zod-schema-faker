import * as core from 'zod/v4/core'
import { Context } from '../context'
import { rootFake as internalFake } from '../fake'
import { Infer } from '../type'

export function fakeReadonly<T extends core.$ZodReadonly>(
  schema: T,
  context: Context,
  rootFake: typeof internalFake,
): Infer<T> {
  return Object.freeze(rootFake(schema._zod.def.innerType, context))
}
