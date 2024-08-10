import * as z from 'zod'
import { fake } from './fake'
import { ZodTypeFaker } from './zod-type-faker'
import { runFake } from './faker'

export class ZodMapFaker<T extends z.ZodMap<any, any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    let i = 0
    const min = 0
    const max = 10
    const result: z.infer<T> = new Map()
    while (++i < min) {
      result.set(fake(this.schema._def.keyType), fake(this.schema._def.valueType))
    }
    while (++i < max) {
      result.set(fake(this.schema._def.keyType), fake(this.schema._def.valueType))

      if (runFake(faker => faker.datatype.boolean())) {
        break
      }
    }

    return result
  }

  static create<T extends z.ZodMap<any, any>>(schema: T): ZodMapFaker<T> {
    return new ZodMapFaker(schema)
  }
}

export const zodMapFaker: <T extends z.ZodMap<any, any>>(schema: T) => ZodMapFaker<T> = ZodMapFaker.create
