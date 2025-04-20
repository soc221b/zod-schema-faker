import * as core from '@zod/core'
import { fake as internalFake } from '../fake'
import { getFaker } from '../random'
import { Context } from '../context'

export function fakeAny<T extends core.$ZodAny>(schema: T, fake: typeof internalFake, context: Context): core.infer<T> {
  return undefined
}
