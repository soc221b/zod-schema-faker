import * as core from '@zod/core'
import { Context } from '../context'
import { fake as internalFake } from '../fake'

export function fakeCatch<T extends core.$ZodCatch>(
  schema: T,
  fake: typeof internalFake,
  context: Context,
): core.infer<T> {
  return fake(schema._zod.def.innerType, context)
}
