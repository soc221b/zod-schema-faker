import * as core from '@zod/core'
import { type fake as _fake } from '../fake'
import { getFaker } from '../random'

export function fakePipe<T extends core.$ZodPipe>(schema: T, fake: typeof _fake): core.infer<T> {
  const left = fake(schema._zod.def.in) as any
  const payload = { value: left, issues: left.issues }
  const context = {}
  const right = schema._zod.def.out._zod.run(payload, context)
  payload.value = right
  return left
}
