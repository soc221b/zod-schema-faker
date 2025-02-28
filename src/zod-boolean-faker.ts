import { z } from 'zod'
import { getFaker } from './random'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodBooleanFaker extends ZodTypeFaker<z.ZodBoolean> {
  fake(): z.infer<z.ZodBoolean> {
    return getFaker().datatype.boolean()
  }
}
