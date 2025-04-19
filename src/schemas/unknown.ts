import * as core from '@zod/core'
import { type fake as _fake } from '../fake'
import { getFaker } from '../random'

export function fakeUnknown<T extends core.$ZodUnknown>(schema: T, fake: typeof _fake): core.infer<T> {
  return undefined
}
