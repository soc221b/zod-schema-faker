import * as core from '@zod/core'
import { type fake as _fake } from '../fake'
import { getFaker } from '../random'

export function fakeSymbol<T extends core.$ZodSymbol>(schema: T, fake: typeof _fake): core.infer<T> {
  return Symbol()
}
