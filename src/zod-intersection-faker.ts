import { z } from 'zod'
import { fake } from './fake'
import { ZodTypeFaker } from './zod-type-faker'
import { maxDateValue, minDateValue } from './zod-date-faker'

export class ZodIntersectionFaker<T extends z.ZodIntersection<any, any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    const leftSchema: z.ZodType = this.schema._def.left
    const rightSchema: z.ZodType = this.schema._def.right

    const bothOf = [this.fakeIfBothAreDate]
    for (const fn of bothOf) {
      const result = fn(leftSchema, rightSchema)
      if (result.success) {
        return result.data
      }
    }

    const oneOf = [
      this.fakeIfOneIsAny,
      this.fakeIfOneIsUnknown,
      this.fakeIfOneIsUndefined,
      this.fakeIfOneIsNull,
      this.fakeIfOneIsNullable,
      this.fakeIfOneIsOptional,
      this.fakeIfOneIsObject,
    ]
    for (const fn of oneOf) {
      const result = fn(leftSchema, rightSchema)
      if (result.success) {
        return result.data
      }
    }

    throw new SyntaxError('ZodIntersectionFaker: unable to fake the given schema')
  }

  private fakeIfBothAreDate = <L extends z.ZodType, R extends z.ZodType>(
    left: L,
    right: R,
  ): { success: true; data: z.infer<L> | z.infer<R> } | { success: false } => {
    if (left instanceof z.ZodDate === false || right instanceof z.ZodDate === false) {
      return { success: false }
    }

    let min = minDateValue
    let max = maxDateValue
    for (let check of left._def.checks) {
      switch (check.kind) {
        case 'min':
          min = Math.max(min, check.value)
          break
        case 'max':
          max = Math.min(max, check.value)
          break
        default: {
          const _: never = check
        }
      }
    }
    for (let check of right._def.checks) {
      switch (check.kind) {
        case 'min':
          min = Math.max(min, check.value)
          break
        case 'max':
          max = Math.min(max, check.value)
          break
        default: {
          const _: never = check
        }
      }
    }

    return { success: true, data: fake(z.date().min(new Date(min)).max(new Date(max))) }
  }

  private fakeIfOneIsAny = <L extends z.ZodType, R extends z.ZodType>(
    left: L,
    right: R,
  ): { success: true; data: z.infer<L> | z.infer<R> } | { success: false } => {
    if (left instanceof z.ZodAny === false && right instanceof z.ZodAny === false) {
      return { success: false }
    }

    const schema = left instanceof z.ZodAny ? right : left
    // zod use `===` to compare the schema type, so we can't generate `NaN` here
    // https://github.com/colinhacks/zod/blob/v3.24.1/src/types.ts#L3405
    while (true) {
      const data = fake(schema)
      if (typeof data === 'number' && !Number.isNaN(data)) {
        return { success: true, data }
      }
    }
  }

  private fakeIfOneIsUnknown = <L extends z.ZodType, R extends z.ZodType>(
    left: L,
    right: R,
  ): { success: true; data: z.infer<L> | z.infer<R> } | { success: false } => {
    if (left instanceof z.ZodUnknown === false && right instanceof z.ZodUnknown === false) {
      return { success: false }
    }

    // zod use `===` to compare the schema type, so we can't generate `NaN` here
    // https://github.com/colinhacks/zod/blob/v3.24.1/src/types.ts#L3405
    const schema = left instanceof z.ZodUnknown ? right : left
    while (true) {
      const data = fake(schema)
      if (typeof data === 'number' && !Number.isNaN(data)) {
        return { success: true, data }
      }
    }
  }

  private fakeIfOneIsUndefined = <L extends z.ZodType, R extends z.ZodType>(
    left: L,
    right: R,
  ): { success: true; data: z.infer<L> | z.infer<R> } | { success: false } => {
    if (left instanceof z.ZodUndefined === false && right instanceof z.ZodUndefined === false) {
      return { success: false }
    }

    return { success: true, data: undefined }
  }

  private fakeIfOneIsOptional = <L extends z.ZodType, R extends z.ZodType>(
    left: L,
    right: R,
  ): { success: true; data: z.infer<L> | z.infer<R> } | { success: false } => {
    if (left instanceof z.ZodOptional === false && right instanceof z.ZodOptional === false) {
      return { success: false }
    }

    return { success: true, data: undefined }
  }

  private fakeIfOneIsNull = <L extends z.ZodType, R extends z.ZodType>(
    left: L,
    right: R,
  ): { success: true; data: z.infer<L> | z.infer<R> } | { success: false } => {
    if (left instanceof z.ZodNull === false && right instanceof z.ZodNull === false) {
      return { success: false }
    }

    return { success: true, data: null }
  }

  private fakeIfOneIsNullable = <L extends z.ZodType, R extends z.ZodType>(
    left: L,
    right: R,
  ): { success: true; data: z.infer<L> | z.infer<R> } | { success: false } => {
    if (left instanceof z.ZodNullable === false && right instanceof z.ZodNullable === false) {
      return { success: false }
    }

    return { success: true, data: null }
  }

  private fakeIfOneIsObject = <L extends z.ZodType, R extends z.ZodType>(
    left: L,
    right: R,
  ): { success: true; data: z.infer<L> | z.infer<R> } | { success: false } => {
    if (left instanceof z.ZodObject === false && right instanceof z.ZodObject === false) {
      return { success: false }
    }

    const leftData = fake(left)
    const rightData = fake(right)
    return { success: true, data: { ...leftData, ...rightData } }
  }
}
