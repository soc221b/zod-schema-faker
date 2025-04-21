import * as core from '@zod/core'
import { Context } from '../context'
import { fake as internalFake } from '../fake'
import { getFaker } from '../random'
import { Infer } from '../type'

export function fakeLiteral<T extends core.$ZodLiteral>(
  schema: T,
  fake: typeof internalFake,
  context: Context,
): Infer<T> {
  return getFaker().helpers.arrayElement(schema._zod.def.values)
}
