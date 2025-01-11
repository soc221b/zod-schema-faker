import { z } from 'zod'
import { fake } from './fake'
import { runFake } from './random'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodDefaultFaker<T extends z.ZodDefault<any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    if (runFake(faker => faker.datatype.boolean())) {
      return this.schema._def.defaultValue()
    } else {
      return fake(this.schema._def.innerType)
    }
  }
}
