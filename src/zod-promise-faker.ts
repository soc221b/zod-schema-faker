import { z } from 'zod'
import { fake } from './fake'
import { ZodTypeFaker } from './zod-type-faker'
import { runFake } from './random'

export class ZodPromiseFaker<T extends z.ZodPromise<any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    const data = Promise.resolve(fake(this.schema._def.type))
    if (runFake(faker => faker.datatype.boolean())) {
      return Promise.resolve(data)
    } else {
      return new Promise(resolve => {
        setTimeout(
          () => resolve(data),
          runFake(faker => faker.number.int({ min: 0, max: 2000 })),
        )
      })
    }
  }
}
