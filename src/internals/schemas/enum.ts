import * as core from '@zod/core'
import { fake as internalFake } from '../fake'
import { getFaker } from '../random'
import { Context } from '../context'

export function fakeEnum<T extends core.$ZodEnum>(
  schema: T,
  fake: typeof internalFake,
  context: Context,
): core.infer<T> {
  return getFaker().helpers.objectValue(schema._zod.def.entries)
}
