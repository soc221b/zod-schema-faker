import { z } from 'zod'
import { fake } from './fake'
import { ZodTypeFaker } from './zod-type-faker'
import { getFaker } from './random'

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
