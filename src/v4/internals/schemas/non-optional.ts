import * as core from 'zod/v4/core'
import { Context } from '../context'
import { rootFake as internalFake } from '../fake'
import { Infer } from '../type'

export function fakeNonOptional<T extends core.$ZodNonOptional>(
  schema: T,
  context: Context,
  rootFake: typeof internalFake,
): Infer<T> {
  // Unwrap multiple inner optional layers if they exist
  // A known issue is that this cannot handle `z.string().optional().nullable().nonoptional()`, But this should still solve most common cases
  let innerType = schema._zod.def.innerType
  while (innerType instanceof core.$ZodOptional) {
    innerType = innerType._zod.def.innerType
  }
  return rootFake(innerType, context)
}
