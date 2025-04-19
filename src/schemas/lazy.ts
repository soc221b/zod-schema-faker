import * as core from '@zod/core'
import { type fake as _fake } from '../fake'
import { getFaker } from '../random'

export function fakeLazy<T extends core.$ZodLazy>(schema: T, fake: typeof _fake): core.infer<T> {
  return fake(schema._zod.def.getter())
}
