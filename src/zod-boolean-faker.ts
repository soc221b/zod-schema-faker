import { z } from 'zod'
import { runFake } from './random'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodBooleanFaker extends ZodTypeFaker<z.ZodBoolean> {
  fake(): z.infer<z.ZodBoolean> {
    return runFake(faker => faker.datatype.boolean())
  }
}
