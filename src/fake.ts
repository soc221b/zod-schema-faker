import * as core from '@zod/core'
import * as mini from '@zod/mini'
import * as zod from 'zod'

export default function fake<T extends zod.ZodType>(schema: T): zod.infer<T>
export default function fake<T extends mini.ZodMiniType>(schema: T): mini.infer<T>
export default function fake(schema: unknown): unknown {
  return undefined
}
