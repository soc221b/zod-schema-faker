import { z } from 'zod'
import { fake } from './fake'
import { runFake } from './random'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodArrayFaker<T extends z.ZodArray<any, any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    const min = this.schema._def.exactLength?.value ?? this.schema._def.minLength?.value ?? 0
    const max =
      this.schema._def.exactLength?.value ??
      this.schema._def.maxLength?.value ??
      runFake(faker => faker.number.int({ min, max: min + 2 }))
    return runFake(faker => faker.helpers.multiple(() => fake(this.schema._def.type), { count: { min, max } }))
  }
}
