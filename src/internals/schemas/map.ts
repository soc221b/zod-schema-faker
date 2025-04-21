import * as core from '@zod/core'
import { Context } from '../context'
import { fake as internalFake } from '../fake'
import { getFaker } from '../random'
import { Infer } from '../type'

export function fakeMap<T extends core.$ZodMap>(schema: T, context: Context, fake: typeof internalFake): Infer<T> {
  return new Map(
    getFaker().helpers.multiple(
      () => [
        fake(schema._zod.def.keyType, context),
        fake(schema._zod.def.valueType, context),
      ],
      {
        count: { min: 0, max: 10 },
      },
    ),
  )
}
