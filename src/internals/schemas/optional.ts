import * as core from '@zod/core'
import { Context } from '../context'
import { fake as internalFake } from '../fake'
import { getFaker } from '../random'
import { Infer } from '../type'

export function fakeOptional<T extends core.$ZodOptional>(
  schema: T,
  context: Context,
  fake: typeof internalFake,
): Infer<T> {
  return getFaker().datatype.boolean() ? fake(schema._zod.def.innerType, context) : undefined
}
