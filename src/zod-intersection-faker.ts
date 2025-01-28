import { UnknownKeysParam, z } from 'zod'
import { fake } from './fake'
import { ZodTypeFaker } from './zod-type-faker'
import { maxDateValue, minDateValue } from './zod-date-faker'

export class ZodIntersectionFaker<T extends z.ZodIntersection<any, any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    const leftSchema: z.ZodType = this.schema._def.left
    const rightSchema: z.ZodType = this.schema._def.right
    const bothOf = [this.fakeIfBothCanBeDate, this.fakeIfBothAreArray, this.fakeIfBothAreObject]
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
    ]
    for (const fn of oneOf) {
      const result = fn(leftSchema, rightSchema)
      if (result.success) {
        return result.data
      }
    }

    throw new SyntaxError('ZodIntersectionFaker: unable to fake the given schema')
  }

  private fakeIfBothCanBeDate = <L extends z.ZodType, R extends z.ZodType>(
    left: L,
    right: R,
  ): { success: true; data: z.infer<L> | z.infer<R> } | { success: false } => {
    left = this.getInnerTypeDespiteNullish(left) as any
    right = this.getInnerTypeDespiteNullish(right) as any
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

  private fakeIfBothAreArray = <L extends z.ZodType, R extends z.ZodType>(
    left: L,
    right: R,
  ): { success: true; data: z.infer<L> | z.infer<R> } | { success: false } => {
    if (left instanceof z.ZodArray === false || right instanceof z.ZodArray === false) {
      return { success: false }
    }

    const length = (() => {
      const minLength = Math.max(left._def.minLength?.value ?? 0, right._def.minLength?.value ?? 0)
      const maxLength =
        typeof left._def.maxLength?.value === 'number' || typeof right._def.maxLength?.value === 'number'
          ? Math.min(left._def.maxLength?.value ?? Infinity, right._def.maxLength?.value ?? Infinity)
          : minLength + 3
      return fake(z.number().int().min(minLength).max(maxLength))
    })()
    const type = z.intersection(left._def.type, right._def.type)
    const data = Array(length)
      .fill(null)
      .map(() => fake(type))
    return { success: true, data }
  }

  private fakeIfBothAreObject = <L extends z.ZodType, R extends z.ZodType>(
    left: L,
    right: R,
  ): { success: true; data: z.infer<L> | z.infer<R> } | { success: false } => {
    if (left instanceof z.ZodObject === false || right instanceof z.ZodObject === false) {
      return { success: false }
    }

    const data = {} as z.infer<L> & z.infer<R>
    const leftUnknownKeys = left._def.unknownKeys as UnknownKeysParam
    const rightUnknownKeys = right._def.unknownKeys as UnknownKeysParam
    const keys = new Set([...Object.keys(left.shape), ...Object.keys(right.shape)])
    for (const key of keys) {
      const leftValue = left.shape[key]
      const rightValue = right.shape[key]
      if (leftValue === undefined) {
        if (left._def.catchall instanceof z.ZodNever) {
          switch (leftUnknownKeys) {
            case 'strict':
              break
            default: {
              const _: 'strip' | 'passthrough' = leftUnknownKeys
              data[key] = fake(rightValue)
            }
          }
        } else {
          data[key] = fake(z.intersection(left._def.catchall, rightValue))
        }
      } else if (rightValue === undefined) {
        if (right._def.catchall instanceof z.ZodNever) {
          switch (rightUnknownKeys) {
            case 'strict':
              break
            default: {
              const _: 'strip' | 'passthrough' = rightUnknownKeys
              data[key] = fake(leftValue)
            }
          }
        } else {
          data[key] = fake(z.intersection(leftValue, right._def.catchall))
        }
      } else {
        data[key] = fake(z.intersection(leftValue, rightValue))
      }
    }
    return { success: true, data }
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

  private getInnerTypeDespiteNullish = <T extends z.ZodNullable<any> | z.ZodOptional<any> | z.ZodType>(
    schema: T,
  ): GetInnerTypeDespiteNullish<T> => {
    if (schema instanceof z.ZodNullable) {
      return this.getInnerTypeDespiteNullish(schema._def.innerType)
    }
    if (schema instanceof z.ZodOptional) {
      return this.getInnerTypeDespiteNullish(schema._def.innerType)
    }
    return schema as any
  }
}

type GetInnerTypeDespiteNullish<T extends z.ZodNullable<any> | z.ZodOptional<any> | z.ZodType> =
  T extends z.ZodNullable<infer U>
    ? GetInnerTypeDespiteNullish<U>
    : T extends z.ZodOptional<infer U>
      ? GetInnerTypeDespiteNullish<U>
      : T
