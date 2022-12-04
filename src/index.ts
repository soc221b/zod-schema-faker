import { z } from 'zod'
import { fake as _fake } from './fake'
import { seed } from './faker'

export const fake = <T extends z.ZodType>(schema: T): z.infer<T> => {
  const result = _fake(schema)
  seed()
  return result
}

export { seed } from './faker'
export { install } from './zod-type-kind-to-zod-type-faker'
export { ZodSchemaFakerError } from './error'
