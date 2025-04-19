import * as core from '@zod/core'
import { type fake as _fake } from '../fake'
import { getFaker } from '../random'

export function fakeDefault<T extends core.$ZodDefault>(schema: T, fake: typeof _fake): core.infer<T> {
  return getFaker().datatype.boolean() ? fake(schema._zod.def.innerType) : schema._zod.def.defaultValue()
}
