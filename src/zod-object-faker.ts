import { z } from 'zod'
import { fake } from './fake'
import { ZodTypeFaker } from './zod-type-faker'
import { runFake } from './random'

export class ZodObjectFaker<T extends z.ZodObject<any, any, any, any, any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    const result = {} as any

    const catchall = this.schema._def.catchall
    const unknownKeys = this.schema._def.unknownKeys
    if (catchall instanceof z.ZodNever) {
      switch (unknownKeys) {
        case 'passthrough': {
          Object.assign(
            result,
            Object.fromEntries(
              runFake(faker =>
                faker.helpers.multiple(() => [fake(z.string().regex(/^extra_[a-z]{5}$/)), fake(z.any())], {
                  count: { min: 0, max: 5 },
                }),
              ),
            ),
          )
        }
      }
    } else {
      Object.assign(
        result,
        Object.fromEntries(
          runFake(faker =>
            faker.helpers.multiple(() => [fake(z.string().regex(/^extra_[a-z]{5}$/)), fake(catchall)], {
              count: { min: 0, max: 5 },
            }),
          ),
        ),
      )
    }

    const shape = this.schema._def.shape()
    const keys = Object.keys(shape)
    for (const key of keys) {
      const value = fake(shape[key])
      result[key] = value
    }

    return result
  }
}
