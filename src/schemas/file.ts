import * as core from '@zod/core'
import { type fake as _fake } from '../fake'
import { getFaker } from '../random'

export function fakeFile<T extends core.$ZodFile>(schema: T, fake: typeof _fake): core.infer<T> {
  return new File([], '.fake')
}
