import * as core from '@zod/core'
import { Context } from '../context'
import { fake as internalFake } from '../fake'
import { Infer } from '../type'

export function fakeVoid<T extends core.$ZodVoid>(schema: T, fake: typeof internalFake, context: Context): Infer<T> {
  return undefined
}
