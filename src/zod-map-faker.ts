import { z } from 'zod'
import { fake } from './fake'
import { ZodTypeFaker } from './zod-type-faker'
import { runFake } from './random'

export class ZodMapFaker<T extends z.ZodMap<any, any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    let i = 0
    const max = 10
    const result: z.infer<T> = new Map()
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

export const zodMapFaker: typeof ZodMapFaker.create = ZodMapFaker.create
