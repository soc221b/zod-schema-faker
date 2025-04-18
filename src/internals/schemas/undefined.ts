import * as core from '@zod/core'
import { fake as internalFake } from '../fake'
import { getFaker } from '../random'
import { Context } from '../context'

export function fakeUndefined<T extends core.$ZodUndefined>(
  schema: T,
  fake: typeof internalFake,
  context: Context,
): core.infer<T> {
  return undefined
}
