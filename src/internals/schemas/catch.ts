import * as core from '@zod/core'
import { fake as internalFake } from '../fake'
import { getFaker } from '../random'
import { Context } from '../context'

export function fakeCatch<T extends core.$ZodCatch>(
  schema: T,
  fake: typeof internalFake,
  context: Context,
): core.infer<T> {
  return fake(schema._zod.def.innerType, context)
}
