import * as core from '@zod/core'
import { Context } from '../context'
import { fake as internalFake } from '../fake'
import { getFaker } from '../random'

export function fakeBoolean<T extends core.$ZodBoolean>(
  schema: T,
  fake: typeof internalFake,
  context: Context,
): core.infer<T> {
  return getFaker().datatype.boolean()
}
