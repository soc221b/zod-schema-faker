import { z } from 'zod/v3'
import { fake } from './fake'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodTupleFaker<T extends z.ZodTuple<any, any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    return [
      ...this.schema._def.items.map((item: any) => fake(item)),
      ...(this.schema._def.rest ? [fake(this.schema._def.rest)] : []),
    ] satisfies z.infer<T>
  }
}
