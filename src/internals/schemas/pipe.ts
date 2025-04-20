import * as core from '@zod/core'
import { Context } from '../context'
import { fake as internalFake } from '../fake'
import { getFaker } from '../random'

const truthyValues = [
  'true',
  '1',
  'yes',
  'on',
  'y',
  'enabled',
]
const falsyValues = [
  'false',
  '0',
  'no',
  'off',
  'n',
  'disabled',
]
const stringBoolValues = [
  ...truthyValues,
  ...falsyValues,
]

export function fakePipe<T extends core.$ZodPipe>(
  schema: T,
  fake: typeof internalFake,
  context: Context,
): core.infer<T> {
  if (schema._zod.def.out._zod.def.type === 'boolean') {
    return getFaker().helpers.arrayElement(stringBoolValues)
  }

  const left = fake(schema._zod.def.in, context) as any
  const payload = { value: left, issues: left.issues }
  const _context = {}
  const right = schema._zod.def.out._zod.run(payload, _context)
  payload.value = right
  return left
}
