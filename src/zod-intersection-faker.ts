import { UnknownKeysParam, z } from 'zod'
import { fake } from './fake'
import { ZodTypeFaker } from './zod-type-faker'
import { maxDateValue, minDateValue } from './zod-date-faker'
import { runFake } from './random'

export class ZodIntersectionFaker<T extends z.ZodIntersection<any, any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    const leftSchema: z.ZodType = this.schema._def.left
    const rightSchema: z.ZodType = this.schema._def.right

    const bothCanBe = [
      this.fakeIfBothCanBeDate,
      this.fakeIfBothCanBeArray,
      this.fakeIfBothCanBeObject,
      this.fakeIfBothCanBeRecord,
      this.fakeIfBothCanBeTuple,
      this.fakeIfBothCanBeUnion,
      this.fakeIfBothCanBeNumber,
      this.fakeIfBothCanBeString,
      this.fakeIfBothCanBeVoid,
      this.fakeIfBothCanBeSymbol,
      this.fakeIfBothCanBeNativeEnum,
      this.fakeIfBothCanBeEnum,
      this.fakeIfBothCanBeLiteral,
      this.fakeIfBothCanBeBoolean,
    ]
    for (const fn of bothCanBe) {
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

  private fakeIfBothCanBeDate = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; data: z.infer<z.ZodType> } | { success: false } => {
    left = this.getInnerTypeDespiteNullish(left)
    right = this.getInnerTypeDespiteNullish(right)
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

  private fakeIfBothCanBeArray = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; data: z.infer<z.ZodType> } | { success: false } => {
    left = this.getInnerTypeDespiteNullish(left)
    right = this.getInnerTypeDespiteNullish(right)
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

  private fakeIfBothCanBeObject = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; data: z.infer<z.ZodType> } | { success: false } => {
    left = this.getInnerTypeDespiteNullish(left)
    right = this.getInnerTypeDespiteNullish(right)
    if (left instanceof z.ZodObject === false || right instanceof z.ZodObject === false) {
      return { success: false }
    }

    const data = {} as any
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

  private fakeIfBothCanBeRecord = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; data: z.infer<z.ZodType> } | { success: false } => {
    left = this.getInnerTypeDespiteNullish(left)
    right = this.getInnerTypeDespiteNullish(right)
    if (left instanceof z.ZodRecord === false || right instanceof z.ZodRecord === false) {
      return { success: false }
    }

    return {
      success: true,
      data: Object.fromEntries(
        runFake(faker =>
          faker.helpers.multiple(
            () => [
              fake(z.intersection(left._def.keyType, right._def.keyType)),
              fake(z.intersection(left._def.valueType, right._def.valueType)),
            ],
            { count: { min: 1, max: 1 } },
          ),
        ),
      ),
    }
  }

  private fakeIfBothCanBeTuple = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; data: z.infer<z.ZodType> } | { success: false } => {
    left = this.getInnerTypeDespiteNullish(left)
    right = this.getInnerTypeDespiteNullish(right)
    if (left instanceof z.ZodTuple === false || right instanceof z.ZodTuple === false) {
      return { success: false }
    }

    if (left._def.items.length >= right._def.items.length) {
      const rest = right._def.rest ?? z.any()
      return {
        success: true,
        data: [
          ...(left._def.items as z.ZodAny[]).slice(0, right._def.items.length).map(type => fake(type)),
          ...(left._def.items as z.ZodAny[])
            .slice(right._def.items.length)
            .map(type => fake(z.intersection(type, rest))),
        ],
      }
    } else {
      const rest = left._def.rest ?? z.any()
      return {
        success: true,
        data: [
          ...(left._def.items as z.ZodAny[]).slice(0, left._def.items.length).map(type => fake(type)),
          ...(right._def.items as z.ZodAny[])
            .slice(left._def.items.length)
            .map(type => fake(z.intersection(type, rest))),
        ],
      }
    }
  }

  private fakeIfBothCanBeUnion = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; data: z.infer<z.ZodType> } | { success: false } => {
    left = this.getInnerTypeDespiteNullish(left)
    right = this.getInnerTypeDespiteNullish(right)
    if (left instanceof z.ZodUnion === false || right instanceof z.ZodUnion === false) {
      return { success: false }
    }

    const leftTypes = left._def.options
    const rightTypes = right._def.options
    for (let leftType of leftTypes) {
      for (let rightType of rightTypes) {
        try {
          return { success: true, data: fake(z.intersection(leftType, rightType)) }
        } catch {}
      }
    }

    return { success: false }
  }

  private fakeIfBothCanBeNumber = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; data: z.infer<z.ZodType> } | { success: false } => {
    left = this.getInnerTypeDespiteNullish(left)
    right = this.getInnerTypeDespiteNullish(right)
    if (left instanceof z.ZodNumber === false || right instanceof z.ZodNumber === false) {
      return { success: false }
    }

    let min = -Infinity
    let max = Infinity
    let int = false
    let finite = false
    let multipleOf = undefined
    for (let check of left._def.checks) {
      switch (check.kind) {
        case 'min':
          min = Math.max(min, check.value)
          break
        case 'max':
          max = Math.min(max, check.value)
          break
        case 'int':
          int = true
          break
        case 'finite':
          finite = true
          break
        case 'multipleOf':
          multipleOf = check.value
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
        case 'int':
          int = true
          break
        case 'finite':
          finite = true
          break
        case 'multipleOf':
          multipleOf = check.value
          break
        default: {
          const _: never = check
        }
      }
    }

    if (min === -Infinity && int === false && finite === false && multipleOf === undefined) {
      if (runFake(faker => faker.datatype.boolean({ probability: 0.2 }))) {
        return { success: true, data: -Infinity }
      }
    }
    if (max === Infinity && int === false && finite === false && multipleOf === undefined) {
      if (runFake(faker => faker.datatype.boolean({ probability: 0.2 }))) {
        return { success: true, data: Infinity }
      }
    }

    min = Math.max(min, Number.MIN_SAFE_INTEGER)
    max = Math.min(max, Number.MAX_SAFE_INTEGER)
    let schema = z.number().min(min).max(max)
    if (int) schema = schema.int()
    if (multipleOf !== undefined) schema = schema.multipleOf(multipleOf)
    return { success: true, data: fake(schema) }
  }

  private fakeIfBothCanBeString = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; data: z.infer<z.ZodType> } | { success: false } => {
    left = this.getInnerTypeDespiteNullish(left)
    right = this.getInnerTypeDespiteNullish(right)
    if (left instanceof z.ZodString === false || right instanceof z.ZodString === false) {
      return { success: false }
    }

    return { success: true, data: fake(z.string()) }
  }

  private fakeIfBothCanBeVoid = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; data: z.infer<z.ZodType> } | { success: false } => {
    left = this.getInnerTypeDespiteNullish(left)
    right = this.getInnerTypeDespiteNullish(right)
    if (left instanceof z.ZodVoid === false || right instanceof z.ZodVoid === false) {
      return { success: false }
    }

    return { success: true, data: undefined }
  }

  private fakeIfBothCanBeSymbol = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; data: z.infer<z.ZodType> } | { success: false } => {
    left = this.getInnerTypeDespiteNullish(left)
    right = this.getInnerTypeDespiteNullish(right)
    if (left instanceof z.ZodSymbol === false || right instanceof z.ZodSymbol === false) {
      return { success: false }
    }

    return { success: true, data: Symbol() }
  }

  private fakeIfBothCanBeNativeEnum = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; data: z.infer<z.ZodType> } | { success: false } => {
    left = this.getInnerTypeDespiteNullish(left)
    right = this.getInnerTypeDespiteNullish(right)
    if (left instanceof z.ZodNativeEnum === false || right instanceof z.ZodNativeEnum === false) {
      return { success: false }
    }

    return { success: true, data: runFake(faker => faker.helpers.enumValue(left._def.values)) }
  }

  private fakeIfBothCanBeEnum = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; data: z.infer<z.ZodType> } | { success: false } => {
    if (left instanceof z.ZodEnum === false || right instanceof z.ZodEnum === false) {
      return { success: false }
    }

    const sharedValues = left._def.values.filter((value: any) => right._def.values.includes(value))

    if (sharedValues.length) {
      return { success: true, data: runFake(faker => faker.helpers.arrayElement(sharedValues)) }
    } else {
      return { success: false }
    }
  }

  private fakeIfBothCanBeLiteral = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; data: z.infer<z.ZodType> } | { success: false } => {
    if (left instanceof z.ZodLiteral === false || right instanceof z.ZodLiteral === false) {
      return { success: false }
    }

    if (left._def.value === right._def.value) {
      return { success: true, data: left._def.value }
    }

    return { success: false }
  }

  private fakeIfBothCanBeBoolean = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; data: z.infer<z.ZodType> } | { success: false } => {
    if (left instanceof z.ZodBoolean === false || right instanceof z.ZodBoolean === false) {
      return { success: false }
    }

    return { success: true, data: runFake(faker => faker.datatype.boolean()) }
  }

  private fakeIfOneIsAny = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; data: z.infer<z.ZodType> } | { success: false } => {
    if (left instanceof z.ZodAny === false && right instanceof z.ZodAny === false) {
      return { success: false }
    }

    const schema = left instanceof z.ZodAny ? right : left
    // zod use `===` to compare the schema type, so we can't generate `NaN` here
    // https://github.com/colinhacks/zod/blob/v3.24.1/src/types.ts#L3405
    while (true) {
      const data = fake(schema)
      if (!Number.isNaN(data)) {
        return { success: true, data }
      }
    }
  }

  private fakeIfOneIsUnknown = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; data: z.infer<z.ZodType> } | { success: false } => {
    if (left instanceof z.ZodUnknown === false && right instanceof z.ZodUnknown === false) {
      return { success: false }
    }

    // zod use `===` to compare the schema type, so we can't generate `NaN` here
    // https://github.com/colinhacks/zod/blob/v3.24.1/src/types.ts#L3405
    const schema = left instanceof z.ZodUnknown ? right : left
    while (true) {
      const data = fake(schema)
      if (!Number.isNaN(data)) {
        return { success: true, data }
      }
    }
  }

  private fakeIfOneIsUndefined = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; data: z.infer<z.ZodType> } | { success: false } => {
    if (left instanceof z.ZodUndefined === false && right instanceof z.ZodUndefined === false) {
      return { success: false }
    }

    return { success: true, data: undefined }
  }

  private fakeIfOneIsOptional = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; data: z.infer<z.ZodType> } | { success: false } => {
    if (left instanceof z.ZodOptional === false && right instanceof z.ZodOptional === false) {
      return { success: false }
    }

    return { success: true, data: undefined }
  }

  private fakeIfOneIsNull = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; data: z.infer<z.ZodType> } | { success: false } => {
    if (left instanceof z.ZodNull === false && right instanceof z.ZodNull === false) {
      return { success: false }
    }

    return { success: true, data: null }
  }

  private fakeIfOneIsNullable = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; data: z.infer<z.ZodType> } | { success: false } => {
    if (left instanceof z.ZodNullable === false && right instanceof z.ZodNullable === false) {
      return { success: false }
    }

    return { success: true, data: null }
  }

  private getInnerTypeDespiteNullish = <T, U>(schema: T): U => {
    if (schema instanceof z.ZodNullable) {
      return this.getInnerTypeDespiteNullish(schema._def.innerType)
    }
    if (schema instanceof z.ZodOptional) {
      return this.getInnerTypeDespiteNullish(schema._def.innerType)
    }
    return schema as any
  }
}
