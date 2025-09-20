import * as core from 'zod/v4/core'
import { Context } from '../context'
import { rootFake as internalFake } from '../fake'
import { Infer } from '../type'

export function fakeTemplateLiteral<T extends core.$ZodTemplateLiteral>(
  schema: T,
  context: Context,
  rootFake: typeof internalFake,
): Infer<T> {
  return schema._zod.def.parts.map(part => (part instanceof core.$ZodType ? rootFake(part, context) : part)).join('')
}
