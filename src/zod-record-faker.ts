import { z } from 'zod'
import { fake } from './fake'
import { ZodTypeFaker } from './zod-type-faker'
import { runFake } from './random'
import { ZodSchemaFakerError } from './error'

export class ZodRecordFaker<T extends z.ZodRecord<any, any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    if (this.schema._def.keyType instanceof z.ZodString === false) {
      throw new ZodSchemaFakerError('Invalid record key type: In runtime JavaScript, all keys are strings.')
    }

    let i = 0
    const max = 10
    const result: Record<any, any> = {}
    while (++i < max) {
      result[fake(this.schema._def.keyType)] = fake(this.schema._def.valueType)
      if (runFake(faker => faker.datatype.boolean())) {
        break
      }
    }
    return result
  }

  static create<T extends z.ZodRecord<any, any>>(schema: T): ZodRecordFaker<T> {
    return new ZodRecordFaker(schema)
  }
}

export const zodRecordFaker: typeof ZodRecordFaker.create = ZodRecordFaker.create
