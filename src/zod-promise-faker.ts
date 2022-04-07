import * as z from 'zod'
import { fake } from './fake'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodPromiseFaker<T extends z.ZodPromise<any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    return Promise.resolve(fake(this.schema._def.type))
  }

  static create<T extends z.ZodPromise<any>>(schema: T): ZodPromiseFaker<T> {
    return new ZodPromiseFaker(schema)
  }
}

export const zodPromiseFaker = ZodPromiseFaker.create
