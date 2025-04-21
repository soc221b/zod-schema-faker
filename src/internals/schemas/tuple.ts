import * as core from '@zod/core'
import { Context } from '../context'
import { fake as internalFake } from '../fake'
import { getFaker } from '../random'
import { Infer } from '../type'

export function fakeTuple<T extends core.$ZodTuple>(schema: T, fake: typeof internalFake, context: Context): Infer<T> {
  return schema._zod.def.items
    .map(item => fake(item, context))
    .concat(
      schema._zod.def.rest
        ? getFaker().helpers.multiple(() => fake(schema._zod.def.rest!, context), { count: { min: 0, max: 5 } })
        : [],
    )
}
