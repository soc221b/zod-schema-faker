import * as core from '@zod/core'
import { Context } from '../context'
import { fake as internalFake } from '../fake'
import { Infer } from '../type'

export function fakeNever<T extends core.$ZodNever>(schema: T, fake: typeof internalFake, context: Context): Infer<T> {
  throw Error('Never')
}
