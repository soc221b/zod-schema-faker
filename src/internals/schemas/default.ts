import * as core from 'zod/v4/core'
import { Context } from '../context'
import { rootFake as internalFake } from '../fake'
import { getFaker } from '../random'
import { Infer } from '../type'

export function fakeDefault<T extends core.$ZodDefault>(
  schema: T,
  context: Context,
  rootFake: typeof internalFake,
): Infer<T> {
  return getFaker().datatype.boolean() ? rootFake(schema._zod.def.innerType, context) : schema._zod.def.defaultValue()
}
