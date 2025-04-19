import * as core from '@zod/core'
import { type fake as _fake } from '../fake'
import { getFaker } from '../random'

export function fakePromise<T extends core.$ZodPromise>(schema: T, fake: typeof _fake): core.infer<T> {
  return Promise.resolve(fake(schema._zod.def.innerType))
}
