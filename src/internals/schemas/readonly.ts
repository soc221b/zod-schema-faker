import * as core from '@zod/core'
import { fake as internalFake } from '../fake'
import { getFaker } from '../random'
import { Context } from '../context'

export function fakeReadonly<T extends core.$ZodReadonly>(
  schema: T,
  fake: typeof internalFake,
  context: Context,
): core.infer<T> {
  return Object.freeze(fake(schema._zod.def.innerType, context))
}
