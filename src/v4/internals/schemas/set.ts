import * as core from 'zod/v4/core'
import { Context } from '../context'
import { rootFake as internalFake } from '../fake'
import { Infer } from '../type'
import { fakeSize, fillUnique } from './checks/size'

export function fakeSet<T extends core.$ZodSet>(schema: T, context: Context, rootFake: typeof internalFake): Infer<T> {
  const { min, size } = fakeSize(schema._zod.def.checks, context)
  const set = new Set()
  fillUnique(set, min, size, () => {
    set.add(rootFake(schema._zod.def.valueType, context))
  })
  if (set.size < min) {
    throw new RangeError(`Unable to generate ${min} unique values for set`)
  }
  return set as Infer<T>
}
