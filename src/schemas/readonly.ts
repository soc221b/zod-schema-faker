import * as core from '@zod/core'
import { type fake as _fake } from '../fake'
import { getFaker } from '../random'

export function fakeReadonly<T extends core.$ZodReadonly>(schema: T, fake: typeof _fake): core.infer<T> {
  return Object.freeze(fake(schema._zod.def.innerType))
}
