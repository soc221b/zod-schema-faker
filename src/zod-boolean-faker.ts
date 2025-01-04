import { z } from 'zod'
import { runFake } from './random'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodBooleanFaker extends ZodTypeFaker<z.ZodBoolean> {
  fake(): z.infer<z.ZodBoolean> {
    return runFake(faker => faker.datatype.boolean())
  }

  static create(schema: z.ZodBoolean): ZodBooleanFaker {
    return new ZodBooleanFaker(schema)
  }
}

export const zodBooleanFaker: typeof ZodBooleanFaker.create = ZodBooleanFaker.create
