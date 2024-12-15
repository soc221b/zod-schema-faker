import { z } from 'zod'
import { fake as _fake } from './fake'
import { resetSeed } from './faker'

export const fake = <T extends z.ZodType>(schema: T): z.infer<T> => {
  const result = _fake(schema)
  resetSeed()
  return result
}

export { seed, runFake, randexp } from './faker'
export { install, installCustom } from './zod-type-kind-to-zod-type-faker'
export { ZodSchemaFakerError } from './error'
export { ZodTypeFaker } from './zod-type-faker'
