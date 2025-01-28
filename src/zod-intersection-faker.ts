import { z } from 'zod'
import { fake } from './fake'
import { ZodTypeFaker } from './zod-type-faker'

export class ZodIntersectionFaker<T extends z.ZodIntersection<any, any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    const leftSchema: z.ZodType = this.schema._def.left
    const rightSchema: z.ZodType = this.schema._def.right

    const fakes = [this.fakeIfOneIsAny, this.fakeIfOneIsUnknown, this.fakeIfOneIsObject]

    for (const fakeFn of fakes) {
      const [isSuccess, value] = fakeFn(leftSchema, rightSchema)
      if (isSuccess) {
        return value as z.infer<T>
      }
    }

    throw new SyntaxError('ZodIntersectionFaker: unable to fake the given schema')
  }

  private fakeIfOneIsAny = <L extends z.ZodType, R extends z.ZodType>(
    left: L,
    right: R,
  ): [boolean, null | z.infer<L> | z.infer<R>] => {
    if (left instanceof z.ZodAny === false && right instanceof z.ZodAny === false) {
      return [false, null]
    }

    const schema = left instanceof z.ZodAny ? right : left
    return [true, fake(schema)]
  }

  private fakeIfOneIsUnknown = <L extends z.ZodType, R extends z.ZodType>(
    left: L,
    right: R,
  ): [boolean, null | z.infer<L> | z.infer<R>] => {
    if (left instanceof z.ZodUnknown === false && right instanceof z.ZodUnknown === false) {
      return [false, null]
    }

    const schema = left instanceof z.ZodUnknown ? right : left
    return [true, fake(schema)]
  }

  private fakeIfOneIsObject = <L extends z.ZodType, R extends z.ZodType>(
    left: L,
    right: R,
  ): [boolean, null | z.infer<L> | z.infer<R>] => {
    if (left instanceof z.ZodObject === false && right instanceof z.ZodObject === false) {
      return [false, null]
    }

    const leftData = fake(left)
    const rightData = fake(right)
    return [true, { ...leftData, ...rightData }]
  }
}
