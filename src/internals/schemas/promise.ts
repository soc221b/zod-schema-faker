import * as core from '@zod/core'
import { Context } from '../context'
import { fake as internalFake } from '../fake'
import { Infer } from '../type'

export function fakePromise<T extends core.$ZodPromise>(
  schema: T,
  context: Context,
  fake: typeof internalFake,
): Infer<T> {
  return Promise.resolve(fake(schema._zod.def.innerType, context))
}
