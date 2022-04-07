import * as z from 'zod'
import { runFake } from './faker'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodEnumFaker<T extends z.ZodEnum<any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    const randomIndex = runFake(faker => faker.datatype.number({ min: 0, max: this.schema._def.values.length - 1 }))
    return this.schema._def.values[randomIndex]
  }

  static create<T extends z.ZodEnum<any>>(schema: T): ZodEnumFaker<T> {
    return new ZodEnumFaker(schema)
  }
}

export const zodEnumFaker = ZodEnumFaker.create
