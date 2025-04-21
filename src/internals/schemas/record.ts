import * as core from '@zod/core'
import { Context } from '../context'
import { fake as internalFake } from '../fake'
import { getFaker } from '../random'
import { Infer } from '../type'

export function fakeRecord<T extends core.$ZodRecord>(
  schema: T,
  fake: typeof internalFake,
  context: Context,
): Infer<T> {
  if (schema._zod.def.keyType instanceof core.$ZodEnum) {
    return Object.fromEntries(
      Object.values(schema._zod.def.keyType._zod.def.entries).map(key => [
        key,
        fake(schema._zod.def.valueType, context),
      ]),
    )
  } else if (schema._zod.def.keyType instanceof core.$ZodLiteral) {
    return Object.fromEntries(
      schema._zod.def.keyType._zod.def.values.map(key => [
        key,
        fake(schema._zod.def.valueType, context),
      ]),
    )
  } else {
    return Object.fromEntries(
      getFaker().helpers.multiple(() => [
        fake(schema._zod.def.keyType, context),
        fake(schema._zod.def.valueType, context),
      ]),
    )
  }
}
