import * as core from '@zod/core'
import { Context } from '../context'
import { rootFake as internalFake } from '../fake'
import { Infer } from '../type'

export function fakePromise<T extends core.$ZodPromise>(
  schema: T,
  context: Context,
  rootFake: typeof internalFake,
): Infer<T> {
  return Promise.resolve(rootFake(schema._zod.def.innerType, context))
}
