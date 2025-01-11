import { z } from 'zod'
import { fake } from './fake'
import { runFake } from './random'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodOptionalFaker<T extends z.ZodOptional<any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    if (runFake(faker => faker.datatype.boolean())) {
      return undefined
    } else {
      return fake(this.schema._def.innerType)
    }
  }
}
