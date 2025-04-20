import * as core from '@zod/core'
import { fake as internalFake } from '../fake'
import { getFaker } from '../random'
import { Context } from '../context'

export function fakeOptional<T extends core.$ZodOptional>(
  schema: T,
  fake: typeof internalFake,
  context: Context,
): core.infer<T> {
  return getFaker().datatype.boolean() ? fake(schema._zod.def.innerType, context) : undefined
}
