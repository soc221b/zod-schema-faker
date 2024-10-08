import * as z from 'zod'
import { fake } from './fake'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodObjectFaker<T extends z.ZodObject<any, any, any, any, any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    const result = {} as any

    const catchall = this.schema._def.catchall
    const unknownKeys = this.schema._def.unknownKeys
    if (catchall instanceof z.ZodNever) {
      switch (unknownKeys) {
        case 'passthrough': {
          result[fake(z.string().max(10))] = fake(z.string())
        }
      }
    } else {
      result[fake(z.string().max(10))] = fake(catchall)
    }

    const shape = this.schema._def.shape()
    const keys = Object.keys(shape)
    for (const key of keys) {
      const value = fake(shape[key])
      result[key] = value
    }

    return result
  }

  static create<T extends z.ZodObject<any, any, any, any, any>>(schema: T): ZodObjectFaker<T> {
    return new ZodObjectFaker(schema)
  }
}

export const zodObjectFaker: typeof ZodObjectFaker.create = ZodObjectFaker.create
