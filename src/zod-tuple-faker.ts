import * as z from 'zod'
import { fake } from './fake'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodTupleFaker<T extends z.ZodTuple<any, any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    return [
      ...this.schema._def.items.map((item: any) => fake(item)),
      ...(this.schema._def.rest ? [fake(this.schema._def.rest)] : []),
    ] satisfies z.infer<T>
  }

  static create<T extends z.ZodTuple<any, any>>(schema: T): ZodTupleFaker<T> {
    return new ZodTupleFaker(schema)
  }
}

export const zodTupleFaker: <T extends z.ZodTuple<any, any>>(schema: T) => ZodTupleFaker<T> = ZodTupleFaker.create
