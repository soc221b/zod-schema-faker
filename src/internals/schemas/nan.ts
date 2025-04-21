import * as core from '@zod/core'
import { Context } from '../context'
import { rootFake as internalFake } from '../fake'
import { Infer } from '../type'

export function fakeNaN<T extends core.$ZodNaN>(schema: T, context: Context, rootFake: typeof internalFake): Infer<T> {
  return NaN
}
