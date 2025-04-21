import * as core from '@zod/core'
import { Context } from '../context'
import { fake as internalFake } from '../fake'
import { Infer } from '../type'

export function fakePromise<T extends core.$ZodPromise>(
  schema: T,
  fake: typeof internalFake,
  context: Context,
): Infer<T> {
  return Promise.resolve(fake(schema._zod.def.innerType, context))
}
