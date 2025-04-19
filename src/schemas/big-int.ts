import * as core from '@zod/core'
import { type fake as _fake } from '../fake'
import { getFaker } from '../random'

export function fakeBigInt<T extends core.$ZodBigInt>(schema: T, fake: typeof _fake): core.infer<T> {
  return 0n
}
