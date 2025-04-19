import * as core from '@zod/core'
import { type fake as _fake } from '../fake'
import { getFaker } from '../random'

export function fakeMap<T extends core.$ZodMap>(schema: T, fake: typeof _fake): core.infer<T> {
  return new Map(
    getFaker().helpers.multiple(() => [fake(schema._zod.def.keyType), fake(schema._zod.def.valueType)], {
      count: { min: 0, max: 10 },
    }),
  )
}
