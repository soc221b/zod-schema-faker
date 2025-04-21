import * as core from '@zod/core'
import { Context } from '../context'
import { fake as internalFake } from '../fake'
import { getFaker } from '../random'
import { Infer } from '../type'

export function fakeBoolean<T extends core.$ZodBoolean>(
  schema: T,
  context: Context,
  fake: typeof internalFake,
): Infer<T> {
  return getFaker().datatype.boolean()
}
