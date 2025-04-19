import * as core from '@zod/core'
import { type fake as _fake } from '../fake'
import { getFaker } from '../random'

export function fakeTemplateLiteral<T extends core.$ZodTemplateLiteral>(schema: T, fake: typeof _fake): core.infer<T> {
  return schema._zod.def.parts.map(part => (part instanceof core.$ZodType ? fake(part) : part)).join('')
}
