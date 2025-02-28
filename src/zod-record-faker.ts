import { z } from 'zod'
import { fake } from './fake'
import { ZodTypeFaker } from './zod-type-faker'
import { getFaker } from './random'
import { ZodSchemaFakerError } from './error'

export class ZodRecordFaker<T extends z.ZodRecord<any, any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    if (this.schema._def.keyType instanceof z.ZodString === false) {
      throw new ZodSchemaFakerError('Invalid record key type: In runtime JavaScript, all keys are strings.')
    }

    return Object.fromEntries(
      getFaker().helpers.multiple(() => [fake(this.schema._def.keyType), fake(this.schema._def.valueType)], {
        count: { min: 0, max: 10 },
      }),
    )
  }
}
