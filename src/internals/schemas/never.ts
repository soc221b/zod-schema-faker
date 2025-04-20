import * as core from '@zod/core'
import { Context } from '../context'
import { fake as internalFake } from '../fake'

export function fakeNever<T extends core.$ZodNever>(
  schema: T,
  fake: typeof internalFake,
  context: Context,
): core.infer<T> {
  throw Error('Never')
}
