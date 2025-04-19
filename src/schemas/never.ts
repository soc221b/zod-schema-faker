import * as core from '@zod/core'
import { type fake as _fake } from '../fake'
import { getFaker } from '../random'

export function fakeNever<T extends core.$ZodNever>(schema: T, fake: typeof _fake): core.infer<T> {
  throw Error('Never')
}
