import { z } from 'zod/v3'
import { fake } from './fake'
import { ZodTypeFaker } from './zod-type-faker'
import { getFaker } from './random'

export class ZodMapFaker<T extends z.ZodMap<any, any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    return new Map(
      getFaker().helpers.multiple(() => [fake(this.schema._def.keyType), fake(this.schema._def.valueType)], {
        count: { min: 1, max: 10 },
      }),
    )
  }
}
