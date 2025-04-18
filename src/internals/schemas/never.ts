import * as core from '@zod/core'
import { fake as internalFake } from '../fake'
import { getFaker } from '../random'
import { Context } from '../context'

export function fakeNever<T extends core.$ZodNever>(
  schema: T,
  fake: typeof internalFake,
  context: Context,
): core.infer<T> {
  throw Error('Never')
}
