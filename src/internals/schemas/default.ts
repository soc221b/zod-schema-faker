import * as core from '@zod/core'
import { Context } from '../context'
import { fake as internalFake } from '../fake'
import { getFaker } from '../random'
import { Infer } from '../type'

export function fakeDefault<T extends core.$ZodDefault>(
  schema: T,
  fake: typeof internalFake,
  context: Context,
): Infer<T> {
  return getFaker().datatype.boolean() ? fake(schema._zod.def.innerType, context) : schema._zod.def.defaultValue()
}
