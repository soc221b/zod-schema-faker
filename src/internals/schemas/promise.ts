import * as core from '@zod/core'
import { fake as internalFake } from '../fake'
import { getFaker } from '../random'
import { Context } from '../context'

export function fakePromise<T extends core.$ZodPromise>(
  schema: T,
  fake: typeof internalFake,
  context: Context,
): core.infer<T> {
  return Promise.resolve(fake(schema._zod.def.innerType, context))
}
