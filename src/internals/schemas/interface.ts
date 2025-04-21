import * as core from '@zod/core'
import { Context } from '../context'
import { rootFake as internalFake } from '../fake'
import { getFaker } from '../random'
import { Infer } from '../type'

export function fakeInterface<T extends core.$ZodInterface>(
  schema: T,
  context: Context,
  rootFake: typeof internalFake,
): Infer<T> {
  return Object.fromEntries(
    Object.entries(schema._zod.def.shape)
      .filter(
        ([
          key,
        ]) => (schema._zod.def.optional.includes(key) ? getFaker().datatype.boolean() : true),
      )
      .concat(
        schema._zod.def.catchall && schema._zod.def.catchall._zod.def.type !== 'never'
          ? getFaker()
              .helpers.multiple(() => getFaker().string.uuid())
              .filter(key => !schema._zod.def.shape[key])
              .map(key => [
                key,
                schema._zod.def.catchall,
              ])
          : [],
      )
      .map(
        ([
          key,
          value,
        ]) => [
          key,
          rootFake(value, { ...context, depth: context.depth + 1 }),
        ],
      ),
  )
}
