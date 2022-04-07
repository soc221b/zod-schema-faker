import * as z from 'zod'
import { fake } from './fake'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodLazyFaker<T extends z.ZodType<any, any, any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    const schema = (this.schema._def as any).getter()

    const safeCount = 10
    let count = 0
    do {
      try {
        return fake(schema)
      } catch {}
    } while (++count < safeCount)

    throw new Error('can not fake a valid data')
  }

  static create<T extends z.ZodType<any, any, any>>(schema: T): ZodLazyFaker<T> {
    return new ZodLazyFaker(schema)
  }
}

export const zodLazyFaker = ZodLazyFaker.create
