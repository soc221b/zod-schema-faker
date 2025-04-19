import * as core from '@zod/core'
import { type fake as _fake } from '../fake'
import { getFaker } from '../random'

export function fakeRecord<T extends core.$ZodRecord>(schema: T, fake: typeof _fake): core.infer<T> {
  if (schema._zod.def.keyType instanceof core.$ZodEnum) {
    return Object.fromEntries(
      Object.values(schema._zod.def.keyType._zod.def.entries).map(key => [key, fake(schema._zod.def.valueType)]),
    )
  } else if (schema._zod.def.keyType instanceof core.$ZodLiteral) {
    return Object.fromEntries(
      schema._zod.def.keyType._zod.def.values.map(key => [key, fake(schema._zod.def.valueType)]),
    )
  } else {
    return Object.fromEntries(
      getFaker().helpers.multiple(() => [fake(schema._zod.def.keyType), fake(schema._zod.def.valueType)]),
    )
  }
}
