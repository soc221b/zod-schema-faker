import * as z from 'zod'
import { runFake } from './faker'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodBigIntFaker extends ZodTypeFaker<z.ZodBigInt> {
  fake(): z.infer<z.ZodBigInt> {
    return runFake(faker => faker.datatype.bigInt())
  }

  static create(schema: z.ZodBigInt): ZodBigIntFaker {
    return new ZodBigIntFaker(schema)
  }
}

export const zodBigIntFaker = ZodBigIntFaker.create
