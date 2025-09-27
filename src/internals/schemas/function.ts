import * as core from 'zod/v4/core'
import { Context } from '../context'
import { rootFake as internalFake } from '../fake'
import { Infer } from '../type'

export function fakeFunction<T extends core.$ZodFunction>(
  schema: T,
  context: Context,
  rootFake: typeof internalFake,
): Infer<T> {
  return (...args: Infer<T['_zod']['def']['input']>): Infer<T['_zod']['def']['output']> => {
    core.parse(schema._zod.def.input, args)
    return rootFake(schema._zod.def.output, context) as Infer<T['_zod']['def']['output']>
  }
}
