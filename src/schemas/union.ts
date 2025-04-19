import * as core from '@zod/core'
import { type fake as _fake } from '../fake'
import { getFaker } from '../random'

export function fakeUnion<T extends core.$ZodUnion>(schema: T, fake: typeof _fake): core.infer<T> {
  const options = schema._zod.def.options.filter(option => option._zod.def.type !== 'never')
  if (options.length === 0) {
    options.push(schema._zod.def.options[0])
  }
  return fake(getFaker().helpers.arrayElement(options))
}
