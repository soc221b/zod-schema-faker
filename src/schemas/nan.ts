import * as core from '@zod/core'
import { type fake as _fake } from '../fake'
import { getFaker } from '../random'

export function fakeNaN<T extends core.$ZodNaN>(schema: T, fake: typeof _fake): core.infer<T> {
  return NaN
}
