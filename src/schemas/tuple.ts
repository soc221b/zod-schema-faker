import * as core from '@zod/core'
import { type fake as _fake } from '../fake'
import { getFaker } from '../random'

export function fakeTuple<T extends core.$ZodTuple>(schema: T, fake: typeof _fake): core.infer<T> {
  return schema._zod.def.items
    .map(item => fake(item))
    .concat(
      schema._zod.def.rest
        ? getFaker().helpers.multiple(() => fake(schema._zod.def.rest!), { count: { min: 0, max: 5 } })
        : [],
    )
}
