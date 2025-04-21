import * as core from '@zod/core'
import { Context } from '../context'
import { fake as internalFake } from '../fake'
import { getFaker } from '../random'
import { Infer } from '../type'

export function fakeUnion<T extends core.$ZodUnion>(schema: T, context: Context, fake: typeof internalFake): Infer<T> {
  const options = schema._zod.def.options.filter(option => option._zod.def.type !== 'never')
  if (options.length === 0) {
    options.push(schema._zod.def.options[0])
  }
  return fake(getFaker().helpers.arrayElement(options), context)
}
