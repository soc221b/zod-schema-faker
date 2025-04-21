import * as core from '@zod/core'
import { Context } from '../context'
import { rootFake as internalFake } from '../fake'
import { getFaker } from '../random'
import { Infer } from '../type'

export function fakeMap<T extends core.$ZodMap>(schema: T, context: Context, rootFake: typeof internalFake): Infer<T> {
  return new Map(
    getFaker().helpers.multiple(
      () => [
        rootFake(schema._zod.def.keyType, context),
        rootFake(schema._zod.def.valueType, context),
      ],
      {
        count: { min: 0, max: 10 },
      },
    ),
  )
}
