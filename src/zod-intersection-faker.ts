import { UnknownKeysParam, z } from 'zod'
import { fake } from './fake'
import { ZodTypeFaker } from './zod-type-faker'
import { maxDateValue, minDateValue } from './zod-date-faker'
import { runFake } from './random'

export class ZodIntersectionFaker<T extends z.ZodIntersection<any, any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    const leftSchema: z.ZodType = this.schema._def.left
    const rightSchema: z.ZodType = this.schema._def.right

    // https://github.com/colinhacks/zod/blob/v3.24.1/src/types.ts#L3405
    if (
      this.getInnerTypeDespiteOptionalAndNullableAndReadonlyAndLazy(leftSchema) instanceof z.ZodNaN &&
      this.getInnerTypeDespiteOptionalAndNullableAndReadonlyAndLazy(rightSchema) instanceof z.ZodNaN
    ) {
      return NaN
    }

    const result = this.findIntersectedSchema(leftSchema, rightSchema)
    if (result.success) {
      let safeCount = 0
      while (++safeCount < 100) {
        const data = fake(result.schema) as z.infer<T>
        if (Number.isNaN(data as any)) {
          continue
        }
        return data
      }
    }

    throw new SyntaxError('ZodIntersectionFaker: unable to fake the given schema')
  }

  private findIntersectedSchema(
    leftSchema: z.ZodType,
    rightSchema: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } {
    const fns = [
      this.findIntersectedSchemaForOptional,
      this.findIntersectedSchemaForNullable,

      this.findIntersectedSchemaForIntersection,
      this.findIntersectedSchemaForLazy,
      this.findIntersectedSchemaForReadonly,

      this.findIntersectedSchemaForUnknown,
      this.findIntersectedSchemaForAny,

      this.findIntersectedSchemaForUndefined,
      this.findIntersectedSchemaForNull,

      this.findIntersectedSchemaForDate,
      this.findIntersectedSchemaForArray,
      this.findIntersectedSchemaForObject,
      this.findIntersectedSchemaForRecord,
      this.findIntersectedSchemaForTuple,
      this.findIntersectedSchemaForUnion,
      this.findIntersectedSchemaForNumber,
      this.findIntersectedSchemaForString,
      this.findIntersectedSchemaForVoid,
      this.findIntersectedSchemaForSymbol,
      this.findIntersectedSchemaForNativeEnum,
      this.findIntersectedSchemaForEnum,
      this.findIntersectedSchemaForLiteral,
      this.findIntersectedSchemaForBoolean,
      this.findIntersectedSchemaForBigInt,
    ]
    for (const fn of fns) {
      const result = fn(leftSchema, rightSchema)
      if (result.success) {
        return result
      }
    }

    return { success: false }
  }

  private findIntersectedSchemaForOptional = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (
      left instanceof z.ZodOptional &&
      right instanceof z.ZodOptional &&
      runFake(faker => faker.datatype.boolean({ probability: 0.2 }))
    ) {
      return { success: true, schema: z.undefined() }
    }

    if (left instanceof z.ZodOptional) {
      const result = this.findIntersectedSchema(left._def.innerType, right)
      if (result.success) {
        return result
      }
    } else if (right instanceof z.ZodOptional) {
      const result = this.findIntersectedSchema(left, right._def.innerType)
      if (result.success) {
        return result
      }
    }

    if (left instanceof z.ZodOptional && right instanceof z.ZodOptional) {
      return { success: true, schema: z.undefined() }
    }

    return { success: false }
  }

  private findIntersectedSchemaForNullable = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (
      left instanceof z.ZodNullable &&
      right instanceof z.ZodNullable &&
      runFake(faker => faker.datatype.boolean({ probability: 0.2 }))
    ) {
      return { success: true, schema: z.null() }
    }

    if (left instanceof z.ZodNullable) {
      const result = this.findIntersectedSchema(left._def.innerType, right)
      if (result.success) {
        return result
      }
    } else if (right instanceof z.ZodNullable) {
      const result = this.findIntersectedSchema(left, right._def.innerType)
      if (result.success) {
        return result
      }
    }

    if (left instanceof z.ZodNullable && right instanceof z.ZodNullable) {
      return { success: true, schema: z.null() }
    }

    return { success: false }
  }

  private findIntersectedSchemaForIntersection = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (left instanceof z.ZodIntersection) {
      const result = this.findIntersectedSchema(left._def.left, left._def.right)
      if (result.success) {
        return { success: true, schema: z.intersection(result.schema, right) }
      }
    } else if (right instanceof z.ZodIntersection) {
      const result = this.findIntersectedSchema(right._def.left, right._def.right)
      if (result.success) {
        return { success: true, schema: z.intersection(left, result.schema) }
      }
    }

    return { success: false }
  }

  private findIntersectedSchemaForLazy = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (left instanceof z.ZodLazy) {
      const result = this.findIntersectedSchema(left._def.getter(), right)
      if (result.success) {
        return result
      }
    } else if (right instanceof z.ZodLazy) {
      const result = this.findIntersectedSchema(left, right._def.getter())
      if (result.success) {
        return result
      }
    }

    return { success: false }
  }

  private findIntersectedSchemaForReadonly = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (left instanceof z.ZodReadonly) {
      const result = this.findIntersectedSchema(left._def.innerType, right)
      if (result.success) {
        return result
      }
    } else if (right instanceof z.ZodReadonly) {
      const result = this.findIntersectedSchema(left, right._def.innerType)
      if (result.success) {
        return result
      }
    }

    return { success: false }
  }

  private findIntersectedSchemaForUnknown = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (left instanceof z.ZodUnknown) {
      return { success: true, schema: right }
    } else if (right instanceof z.ZodUnknown) {
      return { success: true, schema: left }
    }

    return { success: false }
  }

  private findIntersectedSchemaForAny = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (left instanceof z.ZodAny) {
      return { success: true, schema: right }
    } else if (right instanceof z.ZodAny) {
      return { success: true, schema: left }
    }

    return { success: false }
  }

  private findIntersectedSchemaForUndefined = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (
      left instanceof z.ZodUndefined &&
      right instanceof z.ZodUndefined &&
      runFake(faker => faker.datatype.boolean({ probability: 0.2 }))
    ) {
      return { success: true, schema: z.undefined() }
    }

    if (left instanceof z.ZodUndefined) {
      const result = this.findIntersectedSchema(z.never().optional(), right)
      if (result.success) {
        return result
      }
    } else if (right instanceof z.ZodUndefined) {
      const result = this.findIntersectedSchema(left, z.never().optional())
      if (result.success) {
        return result
      }
    }

    return { success: false }
  }

  private findIntersectedSchemaForNull = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (
      left instanceof z.ZodNull &&
      right instanceof z.ZodNull &&
      runFake(faker => faker.datatype.boolean({ probability: 0.2 }))
    ) {
      return { success: true, schema: z.null() }
    }

    if (left instanceof z.ZodNull) {
      const result = this.findIntersectedSchema(z.never().nullable(), right)
      if (result.success) {
        return result
      }
    } else if (right instanceof z.ZodNull) {
      const result = this.findIntersectedSchema(left, z.never().nullable())
      if (result.success) {
        return result
      }
    }

    return { success: false }
  }

  private findIntersectedSchemaForDate = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
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

    return { success: true, schema: z.date().min(new Date(min)).max(new Date(max)) }
  }

  private findIntersectedSchemaForArray = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
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
    return { success: true, schema: z.array(type).length(length) }
  }

  private findIntersectedSchemaForObject = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (left instanceof z.ZodObject === false || right instanceof z.ZodObject === false) {
      return { success: false }
    }

    let schema = z.object({})
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
              schema = schema.merge(z.object({ [key]: rightValue }))
            }
          }
        } else {
          schema = schema.merge(z.object({ [key]: z.intersection(left._def.catchall, rightValue) }))
        }
      } else if (rightValue === undefined) {
        if (right._def.catchall instanceof z.ZodNever) {
          switch (rightUnknownKeys) {
            case 'strict':
              break
            default: {
              const _: 'strip' | 'passthrough' = rightUnknownKeys
              schema = schema.merge(z.object({ [key]: leftValue }))
            }
          }
        } else {
          schema = schema.merge(z.object({ [key]: z.intersection(leftValue, right._def.catchall) }))
        }
      } else {
        schema = schema.merge(
          z.object({
            [key]: z.intersection(leftValue, rightValue),
          }),
        )
      }
    }
    return { success: true, schema }
  }

  private findIntersectedSchemaForRecord = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (left instanceof z.ZodRecord === false || right instanceof z.ZodRecord === false) {
      return { success: false }
    }

    return {
      success: true,
      schema: z.record(z.intersection(left._def.valueType, right._def.valueType)),
    }
  }

  private findIntersectedSchemaForTuple = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (left instanceof z.ZodTuple === false || right instanceof z.ZodTuple === false) {
      return { success: false }
    }

    if (left._def.items.length >= right._def.items.length) {
      const rest = right._def.rest ?? z.any()
      return {
        success: true,
        schema: z.tuple([
          ...(left._def.items as z.ZodAny[]).slice(0, right._def.items.length),
          ...(left._def.items as z.ZodAny[]).slice(right._def.items.length).map(type => z.intersection(type, rest)),
        ] as any),
      }
    } else {
      const rest = left._def.rest ?? z.any()
      return {
        success: true,
        schema: z.tuple([
          ...(left._def.items as z.ZodAny[]).slice(0, left._def.items.length),
          ...(right._def.items as z.ZodAny[]).slice(left._def.items.length).map(type => z.intersection(type, rest)),
        ] as any),
      }
    }
  }

  private findIntersectedSchemaForUnion = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (left instanceof z.ZodUnion === false || right instanceof z.ZodUnion === false) {
      return { success: false }
    }

    const leftTypes = left._def.options
    const rightTypes = right._def.options
    for (let leftType of leftTypes) {
      for (let rightType of rightTypes) {
        const result = this.findIntersectedSchema(leftType, rightType)
        if (result.success) {
          return result
        }
      }
    }

    return { success: false }
  }

  private findIntersectedSchemaForNumber = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
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
        return { success: true, schema: z.literal(-Infinity) }
      }
    }
    if (max === Infinity && int === false && finite === false && multipleOf === undefined) {
      if (runFake(faker => faker.datatype.boolean({ probability: 0.2 }))) {
        return { success: true, schema: z.literal(Infinity) }
      }
    }

    min = Math.max(min, Number.MIN_SAFE_INTEGER)
    max = Math.min(max, Number.MAX_SAFE_INTEGER)
    let schema = z.number().min(min).max(max)
    if (int) schema = schema.int()
    if (multipleOf !== undefined) schema = schema.multipleOf(multipleOf)
    return { success: true, schema }
  }

  private findIntersectedSchemaForString = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (left instanceof z.ZodString === false || right instanceof z.ZodString === false) {
      return { success: false }
    }

    const dedicatedKinds = [
      'email',
      'url',
      'uuid',
      'nanoid',
      'cuid',
      'cuid2',
      'ulid',
      'regex',
      'jwt',
      'datetime',
      'date',
      'time',
      'duration',
      'ip',
      'cidr',
      'base64',
      'base64url',
    ] as const
    for (let check of left._def.checks) {
      for (let kind of dedicatedKinds) {
        if (check.kind === kind) {
          return { success: true, schema: left }
        }
      }
    }
    for (let check of right._def.checks) {
      for (let kind of dedicatedKinds) {
        if (check.kind === kind) {
          return { success: true, schema: right }
        }
      }
    }

    let min: undefined | number = undefined
    let max: undefined | number = undefined
    let endsWith: undefined | string = undefined
    let includes: undefined | string = undefined
    let startsWith: undefined | string = undefined
    let toLowercase = false
    let toUppercase = false
    let trim = false
    let emoji = false
    for (let check of left._def.checks) {
      switch (check.kind) {
        case 'min':
          min = check.value
          break
        case 'max':
          max = check.value
          break
        case 'length':
          min = check.value
          max = check.value
          break
        case 'endsWith':
          endsWith = check.value
          break
        case 'includes':
          includes = check.value
          break
        case 'startsWith':
          startsWith = check.value
          break
        case 'toLowerCase':
          toLowercase = true
          break
        case 'toUpperCase':
          toUppercase = true
          break
        case 'trim':
          trim = true
          break
        case 'emoji':
          emoji = true
          break
        default: {
          const _: (typeof dedicatedKinds)[number] = check.kind
        }
      }
    }
    for (let check of right._def.checks) {
      switch (check.kind) {
        case 'min':
          min = Math.min(min ?? check.value, check.value)
          break
        case 'max':
          max = Math.max(max ?? check.value, check.value)
          break
        case 'length':
          min = Math.min(min ?? check.value, check.value)
          max = Math.max(max ?? check.value, check.value)
          break
        case 'endsWith':
          endsWith = check.value
          break
        case 'includes':
          includes = check.value
          break
        case 'startsWith':
          startsWith = check.value
          break
        case 'toLowerCase':
          toLowercase = true
          break
        case 'toUpperCase':
          toUppercase = true
          break
        case 'trim':
          trim = true
          break
        case 'emoji':
          emoji = true
          break
        default: {
          const _: (typeof dedicatedKinds)[number] = check.kind
        }
      }
    }
    let schema = z.string()
    if (min !== undefined) schema = schema.min(min)
    if (max !== undefined) schema = schema.max(max)
    if (endsWith !== undefined) schema = schema.endsWith(endsWith)
    if (includes !== undefined) schema = schema.includes(includes)
    if (startsWith !== undefined) schema = schema.startsWith(startsWith)
    if (toLowercase) schema = schema.toLowerCase()
    if (toUppercase) schema = schema.toUpperCase()
    if (trim) schema = schema.trim()
    if (emoji) schema = schema.emoji()
    return { success: true, schema }
  }

  private findIntersectedSchemaForVoid = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (left instanceof z.ZodVoid === false || right instanceof z.ZodVoid === false) {
      return { success: false }
    }

    return { success: true, schema: left }
  }

  private findIntersectedSchemaForSymbol = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (left instanceof z.ZodSymbol === false || right instanceof z.ZodSymbol === false) {
      return { success: false }
    }

    return { success: true, schema: left }
  }

  private findIntersectedSchemaForNativeEnum = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (left instanceof z.ZodNativeEnum === false || right instanceof z.ZodNativeEnum === false) {
      return { success: false }
    }

    return { success: true, schema: left }
  }

  private findIntersectedSchemaForEnum = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (left instanceof z.ZodEnum === false || right instanceof z.ZodEnum === false) {
      return { success: false }
    }

    const sharedValues = left._def.values.filter((value: any) => right._def.values.includes(value))

    if (sharedValues.length) {
      return { success: true, schema: z.enum(sharedValues) }
    } else {
      return { success: false }
    }
  }

  private findIntersectedSchemaForLiteral = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (left instanceof z.ZodLiteral === false || right instanceof z.ZodLiteral === false) {
      return { success: false }
    }

    if (left._def.value === right._def.value) {
      return { success: true, schema: left }
    }

    return { success: false }
  }

  private findIntersectedSchemaForBoolean = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (left instanceof z.ZodBoolean === false || right instanceof z.ZodBoolean === false) {
      return { success: false }
    }

    return { success: true, schema: left }
  }

  private findIntersectedSchemaForBigInt = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (left instanceof z.ZodBigInt === false || right instanceof z.ZodBigInt === false) {
      return { success: false }
    }

    let min: undefined | bigint = undefined
    let max: undefined | bigint = undefined
    let multipleOf: undefined | bigint = undefined
    for (let check of left._def.checks) {
      switch (check.kind) {
        case 'min':
          min = check.value
          break
        case 'max':
          max = check.value
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
          min = min === undefined ? check.value : min > check.value ? min : check.value
          break
        case 'max':
          max = max === undefined ? check.value : max < check.value ? max : check.value
          break
        case 'multipleOf':
          multipleOf = multipleOf === undefined ? check.value : multipleOf < check.value ? multipleOf : check.value
          break
        default: {
          const _: never = check
        }
      }
    }
    let schema = z.bigint()
    if (min !== undefined) schema = schema.min(min)
    if (max !== undefined) schema = schema.max(max)
    if (multipleOf !== undefined) schema = schema.multipleOf(multipleOf)
    return { success: true, schema }
  }

  private getInnerTypeDespiteOptionalAndNullableAndReadonlyAndLazy = <T, U>(schema: T): U => {
    if (schema instanceof z.ZodNullable) {
      return this.getInnerTypeDespiteOptionalAndNullableAndReadonlyAndLazy(schema._def.innerType)
    }
    if (schema instanceof z.ZodOptional) {
      return this.getInnerTypeDespiteOptionalAndNullableAndReadonlyAndLazy(schema._def.innerType)
    }
    if (schema instanceof z.ZodReadonly) {
      return this.getInnerTypeDespiteOptionalAndNullableAndReadonlyAndLazy(schema._def.innerType)
    }
    if (schema instanceof z.ZodLazy) {
      return this.getInnerTypeDespiteOptionalAndNullableAndReadonlyAndLazy(schema._def.getter())
    }
    return schema as any
  }
}
