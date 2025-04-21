import * as core from '@zod/core'
import { Context } from '../context'
import { fake as internalFake } from '../fake'
import { Infer } from '../type'

export function fakeCatch<T extends core.$ZodCatch>(schema: T, context: Context, fake: typeof internalFake): Infer<T> {
  return fake(schema._zod.def.innerType, context)
}
