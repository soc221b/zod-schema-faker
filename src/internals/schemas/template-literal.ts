import * as core from '@zod/core'
import { Context } from '../context'
import { fake as internalFake } from '../fake'
import { Infer } from '../type'

export function fakeTemplateLiteral<T extends core.$ZodTemplateLiteral>(
  schema: T,
  fake: typeof internalFake,
  context: Context,
): Infer<T> {
  return schema._zod.def.parts.map(part => (part instanceof core.$ZodType ? fake(part, context) : part)).join('')
}
