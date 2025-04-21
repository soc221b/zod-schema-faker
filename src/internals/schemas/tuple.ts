import * as core from '@zod/core'
import { Context } from '../context'
import { rootFake as internalFake } from '../fake'
import { getFaker } from '../random'
import { Infer } from '../type'

export function fakeTuple<T extends core.$ZodTuple>(
  schema: T,
  context: Context,
  rootFake: typeof internalFake,
): Infer<T> {
  return schema._zod.def.items
    .map(item => rootFake(item, context))
    .concat(
      schema._zod.def.rest
        ? getFaker().helpers.multiple(() => rootFake(schema._zod.def.rest!, context), { count: { min: 0, max: 5 } })
        : [],
    )
}
