import { z } from 'zod/v3'
import { fake } from './fake'
import { getFaker } from './random'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodPromiseFaker<T extends z.ZodPromise<any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    const data = fake(this.schema._def.type)
    if (getFaker().datatype.boolean()) {
      return Promise.resolve(data)
    } else {
      return new Promise(resolve => {
        setTimeout(() => resolve(data))
      })
    }
  }
}
