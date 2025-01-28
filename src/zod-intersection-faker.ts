import { z } from 'zod'
import { fake } from './fake'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodIntersectionFaker<T extends z.ZodIntersection<any, any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    const leftSchema: z.ZodAny = this.schema._def.left
    const rightSchema: z.ZodAny = this.schema._def.right

    return leftSchema instanceof z.ZodAny ? fake(rightSchema) : fake(leftSchema)
  }
}
