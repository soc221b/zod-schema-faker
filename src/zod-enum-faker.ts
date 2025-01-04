import { z } from 'zod'
import { runFake } from './random'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodEnumFaker<T extends z.ZodEnum<any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    return runFake(faker => faker.helpers.arrayElement(this.schema._def.values))
  }

  static create<T extends z.ZodEnum<any>>(schema: T): ZodEnumFaker<T> {
    return new ZodEnumFaker(schema)
  }
}

export const zodEnumFaker: typeof ZodEnumFaker.create = ZodEnumFaker.create
