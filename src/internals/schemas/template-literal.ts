import * as core from '@zod/core'
import { Context } from '../context'
import { fake as internalFake } from '../fake'

export function fakeTemplateLiteral<T extends core.$ZodTemplateLiteral>(
  schema: T,
  fake: typeof internalFake,
  context: Context,
): core.infer<T> {
  return schema._zod.def.parts.map(part => (part instanceof core.$ZodType ? fake(part, context) : part)).join('')
}
