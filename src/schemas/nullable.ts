import * as core from '@zod/core'
import { type fake as _fake } from '../fake'
import { getFaker } from '../random'

export function fakeNullable<T extends core.$ZodNullable>(schema: T, fake: typeof _fake): core.infer<T> {
  return getFaker().datatype.boolean() ? fake(schema._zod.def.innerType) : null
}
