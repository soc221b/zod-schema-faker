import * as core from 'zod/v4/core'
import { Context } from '../context'
import { rootFake as internalFake } from '../fake'
import { Infer } from '../type'
import { fakeSize, fillUnique } from './checks/size'

export function fakeMap<T extends core.$ZodMap>(schema: T, context: Context, rootFake: typeof internalFake): Infer<T> {
  const { min, size } = fakeSize(schema._zod.def.checks, context)
  const map = new Map()
  fillUnique(map, min, size, () => {
    const key = rootFake(schema._zod.def.keyType, context)
    if (!map.has(key)) {
      map.set(key, rootFake(schema._zod.def.valueType, context))
    }
  })
  if (map.size < min) {
    throw new RangeError(`Unable to generate ${min} unique keys for map`)
  }
  return map as Infer<T>
}
