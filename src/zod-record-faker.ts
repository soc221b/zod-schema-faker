import * as z from 'zod'
import { fake } from './fake'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodRecordFaker<T extends z.ZodRecord<any, any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    return { [fake(this.schema._def.keyType)]: fake(this.schema._def.valueType) }
  }

  static create<T extends z.ZodRecord<any, any>>(schema: T): ZodRecordFaker<T> {
    return new ZodRecordFaker(schema)
  }
}

export const zodRecordFaker = ZodRecordFaker.create
