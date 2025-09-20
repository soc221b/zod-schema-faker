import * as core from 'zod/v4/core'
import { Context } from '../context'
import { rootFake as internalFake } from '../fake'
import { getFaker } from '../random'
import { Infer } from '../type'

export function fakeEnum<T extends core.$ZodEnum>(
  schema: T,
  context: Context,
  rootFake: typeof internalFake,
): Infer<T> {
  return getFaker().helpers.objectValue(schema._zod.def.entries)
}
