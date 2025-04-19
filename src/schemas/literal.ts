import * as core from '@zod/core'
import { type fake as _fake } from '../fake'
import { getFaker } from '../random'

export function fakeLiteral<T extends core.$ZodLiteral>(schema: T, fake: typeof _fake): core.infer<T> {
  return getFaker().helpers.arrayElement(schema._zod.def.values)
}
