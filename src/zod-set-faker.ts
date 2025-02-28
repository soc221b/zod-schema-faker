import { z } from 'zod'
import { fake } from './fake'
import { getFaker } from './random'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodSetFaker<T extends z.ZodSet<any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    const min = this.schema._def.minSize?.value ?? 0
    const max = this.schema._def.maxSize?.value ?? getFaker().number.int({ min, max: min + 10 })

    if (min > max) {
      throw new RangeError()
    }

    const set = new Set()
    while (set.size < min) {
      set.add(fake(this.schema._def.valueType))
    }
    while (set.size < max && getFaker().datatype.boolean()) {
      set.add(fake(this.schema._def.valueType))
    }
    return set
  }
}
