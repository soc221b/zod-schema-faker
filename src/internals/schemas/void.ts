import * as core from '@zod/core'
import { Context } from '../context'
import { fake as internalFake } from '../fake'
import { Infer } from '../type'

export function fakeVoid<T extends core.$ZodVoid>(schema: T, context: Context, fake: typeof internalFake): Infer<T> {
  return undefined
}
