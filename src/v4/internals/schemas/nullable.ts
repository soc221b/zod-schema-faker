import * as core from 'zod/v4/core'
import { Context } from '../context'
import { rootFake as internalFake } from '../fake'
import { getFaker } from '../random'
import { Infer } from '../type'

export function fakeNullable<T extends core.$ZodNullable>(
  schema: T,
  context: Context,
  rootFake: typeof internalFake,
): Infer<T> {
  return getFaker().datatype.boolean() ? rootFake(schema._zod.def.innerType, context) : null
}
