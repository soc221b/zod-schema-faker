import * as z from 'zod'
import { runFake } from './faker'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodDateFaker extends ZodTypeFaker<z.ZodDate> {
  fake(): z.infer<z.ZodDate> {
    return runFake(faker => faker.datatype.datetime())
  }

  static create(schema: z.ZodDate): ZodDateFaker {
    return new ZodDateFaker(schema)
  }
}

export const zodDateFaker = ZodDateFaker.create
