import { z } from 'zod'
import { fake } from './fake'
import { runFake } from './random'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodOptionalFaker<T extends z.ZodOptional<any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    return runFake(faker => faker.datatype.boolean()) ? undefined : fake(this.schema._def.innerType)
  }
}
