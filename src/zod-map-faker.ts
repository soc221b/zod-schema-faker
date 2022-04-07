import * as z from 'zod'
import { fake } from './fake'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodMapFaker<T extends z.ZodMap<any, any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    return new Map([[fake(this.schema._def.keyType), fake(this.schema._def.valueType)]])
  }

  static create<T extends z.ZodMap<any, any>>(schema: T): ZodMapFaker<T> {
    return new ZodMapFaker(schema)
  }
}

export const zodMapFaker = ZodMapFaker.create
