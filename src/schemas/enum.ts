import * as core from '@zod/core'
import { type fake as _fake } from '../fake'
import { getFaker } from '../random'

export function fakeEnum<T extends core.$ZodEnum>(schema: T, fake: typeof _fake): core.infer<T> {
  return getFaker().helpers.objectValue(schema._zod.def.entries)
}
