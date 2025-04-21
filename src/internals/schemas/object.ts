import * as core from '@zod/core'
import { Context } from '../context'
import { fake as internalFake } from '../fake'
import { getFaker } from '../random'
import { Infer } from '../type'

export function fakeObject<T extends core.$ZodObject>(
  schema: T,
  fake: typeof internalFake,
  context: Context,
): Infer<T> {
  return Object.fromEntries(
    Object.entries(schema._zod.def.shape)
      .concat(
        schema._zod.def.catchall && schema._zod.def.catchall._zod.def.type !== 'never'
          ? getFaker()
              .helpers.multiple(() => getFaker().string.uuid())
              .filter(key => !schema._zod.def.shape[key])
              .map(key => [
                key,
                schema._zod.def.catchall!,
              ])
          : [],
      )
      .map(
        ([
          key,
          value,
        ]) => [
          key,
          fake(value, context),
        ],
      ),
  )
}
