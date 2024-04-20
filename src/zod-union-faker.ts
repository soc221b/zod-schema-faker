import * as z from 'zod'
import { fake } from './fake'
import { runFake } from './faker'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodUnionFaker<T extends z.ZodUnion<any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    const randomIndex = runFake(faker => faker.number.int({ min: 0, max: this.schema._def.options.length - 1 }))
    const randomSchema = this.schema._def.options[randomIndex]
    return fake(randomSchema)
  }

  static create<T extends z.ZodUnion<any>>(schema: T): ZodUnionFaker<T> {
    return new ZodUnionFaker(schema)
  }
}

export const zodUnionFaker = ZodUnionFaker.create
