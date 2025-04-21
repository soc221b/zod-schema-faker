import * as core from '@zod/core'
import { Context } from '../context'
import { fake as internalFake } from '../fake'
import { Infer } from '../type'

export function fakeCatch<T extends core.$ZodCatch>(schema: T, fake: typeof internalFake, context: Context): Infer<T> {
  return fake(schema._zod.def.innerType, context)
}
