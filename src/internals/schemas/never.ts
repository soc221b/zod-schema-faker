import * as core from '@zod/core'
import { Context } from '../context'
import { rootFake as internalFake } from '../fake'
import { Infer } from '../type'

export function fakeNever<T extends core.$ZodNever>(
  schema: T,
  context: Context,
  rootFake: typeof internalFake,
): Infer<T> {
  throw Error()
}
