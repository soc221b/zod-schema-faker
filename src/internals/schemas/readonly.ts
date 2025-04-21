import * as core from '@zod/core'
import { Context } from '../context'
import { fake as internalFake } from '../fake'
import { Infer } from '../type'

export function fakeReadonly<T extends core.$ZodReadonly>(
  schema: T,
  context: Context,
  fake: typeof internalFake,
): Infer<T> {
  return Object.freeze(fake(schema._zod.def.innerType, context))
}
