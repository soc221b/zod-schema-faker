import { z } from 'zod'
import { fake } from './fake'
import { ZodTypeFaker } from './zod-type-faker'
import { runFake } from './random'

export class ZodMapFaker<T extends z.ZodMap<any, any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    return new Map(
      runFake(faker =>
        faker.helpers.multiple(() => [fake(this.schema._def.keyType), fake(this.schema._def.valueType)], {
          count: { min: 1, max: 10 },
        }),
      ),
    )
  }
}
