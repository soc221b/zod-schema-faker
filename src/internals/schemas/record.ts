import * as core from 'zod/v4/core'
import { Context } from '../context'
import { rootFake as internalFake } from '../fake'
import { getFaker } from '../random'
import { Infer } from '../type'

export function fakeRecord<T extends core.$ZodRecord>(
  schema: T,
  context: Context,
  rootFake: typeof internalFake,
): Infer<T> {
  if (schema._zod.def.keyType instanceof core.$ZodEnum) {
    return Object.fromEntries(
      Object.values(schema._zod.def.keyType._zod.def.entries).map(key => [
        key,
        rootFake(schema._zod.def.valueType, context),
      ]),
    )
  } else if (schema._zod.def.keyType instanceof core.$ZodLiteral) {
    return Object.fromEntries(
      schema._zod.def.keyType._zod.def.values.map(key => [
        key,
        rootFake(schema._zod.def.valueType, context),
      ]),
    )
  } else {
    return Object.fromEntries(
      getFaker().helpers.multiple(() => [
        rootFake(schema._zod.def.keyType, context),
        rootFake(schema._zod.def.valueType, context),
      ]),
    )
  }
}
