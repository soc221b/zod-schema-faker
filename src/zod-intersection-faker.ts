import { UnknownKeysParam, z, ZodString } from 'zod'
import { fake } from './fake'
import { ZodTypeFaker } from './zod-type-faker'
import { runFake } from './random'

export class ZodIntersectionFaker<T extends z.ZodIntersection<any, any>> extends ZodTypeFaker<T> {
  fake(): z.infer<T> {
    const result = this.findIntersectedSchema(this.schema._def.left, this.schema._def.right)
    if (result.success) {
      return fake(result.schema) as z.infer<T>
    } else {
      throw new TypeError('ZodIntersectionFaker: unable to fake the given schema')
    }
  }

  findIntersectedSchema(
    leftSchema: z.ZodType,
    rightSchema: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } {
    const fns = [
      this.findIntersectedSchemaForUndefined,
      this.findIntersectedSchemaForOptional,
      this.findIntersectedSchemaForDefault,
      this.findIntersectedSchemaForCatch,

      this.findIntersectedSchemaForNull,
      this.findIntersectedSchemaForNullable,

      this.findIntersectedSchemaForIntersection,
      this.findIntersectedSchemaForLazy,
      this.findIntersectedSchemaForReadonly,
      this.findIntersectedSchemaForPipe,
      this.findIntersectedSchemaForBrand,

      this.findIntersectedSchemaForUnknown,
      this.findIntersectedSchemaForAny,

      this.findIntersectedSchemaForArray,
      this.findIntersectedSchemaForBigint,
      this.findIntersectedSchemaForBoolean,
      this.findIntersectedSchemaForDate,
      this.findIntersectedSchemaForDiscriminatedUnion,
      this.findIntersectedSchemaForDiscriminatedUnionAndObject,
      this.findIntersectedSchemaForDiscriminatedUnionAndRecord,
      this.findIntersectedSchemaForEnum,
      this.findIntersectedSchemaForLiteral,
      this.findIntersectedSchemaForNativeEnum,
      this.findIntersectedSchemaForNumber,
      this.findIntersectedSchemaForObject,
      this.findIntersectedSchemaForObjectAndRecord,
      this.findIntersectedSchemaForRecordWithKeyTypeString,
      this.findIntersectedSchemaForString,
      this.findIntersectedSchemaForSymbol,
      this.findIntersectedSchemaForTuple,
      this.findIntersectedSchemaForTupleAndArray,
      this.findIntersectedSchemaForUnion,
      this.findIntersectedSchemaForUnionAndNonUnion,
      this.findIntersectedSchemaForVoid,
    ]
    for (const fn of fns) {
      const result = fn(leftSchema, rightSchema)
      if (result.success) {
        return result
      }
    }

    return { success: false }
  }

  private findIntersectedSchemaForUndefined = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (right instanceof z.ZodUndefined) {
      const result = this.findIntersectedSchema(z.never().optional(), left)
      if (result.success) {
        return result
      }
    }

    if (left instanceof z.ZodUndefined) {
      return this.findIntersectedSchemaForUndefined(right, left)
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

    if (right instanceof z.ZodOptional) {
      const result = this.findIntersectedSchema(left, right._def.innerType)
      if (result.success) {
        return result
      }
    }

    if (left instanceof z.ZodOptional) {
      return this.findIntersectedSchemaForOptional(right, left)
    }

    return { success: false }
  }

  private findIntersectedSchemaForDefault = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (right instanceof z.ZodDefault) {
      return {
        success: true,
        schema: z.union([
          z.lazy(() => z.literal(right._def.defaultValue())),
          z.intersection(left, right._def.innerType),
        ]),
      }
    }

    if (left instanceof z.ZodDefault) {
      return this.findIntersectedSchemaForDefault(right, left)
    }

    return { success: false }
  }

  private findIntersectedSchemaForCatch = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (right instanceof z.ZodCatch) {
      return {
        success: true,
        schema: z.union([
          z.lazy(() =>
            z.literal(
              right._def.catchValue({
                error: new z.ZodError([]),
                input: undefined,
              }),
            ),
          ),
          z.intersection(left, right._def.innerType),
        ]),
      }
    }

    if (left instanceof z.ZodCatch) {
      return this.findIntersectedSchemaForCatch(right, left)
    }

    return { success: false }
  }

  private findIntersectedSchemaForNull = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (right instanceof z.ZodNull) {
      const result = this.findIntersectedSchema(left, z.never().nullable())
      if (result.success) {
        return result
      }
    }

    if (left instanceof z.ZodNull) {
      return this.findIntersectedSchemaForNull(right, left)
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

    if (right instanceof z.ZodNullable) {
      const result = this.findIntersectedSchema(left, right._def.innerType)
      if (result.success) {
        return result
      }
    }

    if (left instanceof z.ZodNullable) {
      return this.findIntersectedSchemaForNullable(right, left)
    }

    return { success: false }
  }

  private findIntersectedSchemaForIntersection = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (right instanceof z.ZodIntersection) {
      const rightIntersectedSchema = this.findIntersectedSchema(right._def.left, right._def.right)
      if (rightIntersectedSchema.success) {
        const intersectedSchema = this.findIntersectedSchema(left, rightIntersectedSchema.schema)
        if (intersectedSchema.success) {
          return { success: true, schema: intersectedSchema.schema }
        }
      }

      return { success: false }
    }

    if (left instanceof z.ZodIntersection) {
      return this.findIntersectedSchemaForIntersection(right, left)
    }

    return { success: false }
  }

  private findIntersectedSchemaForLazy = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (right instanceof z.ZodLazy) {
      const result = this.findIntersectedSchema(left, right._def.getter())
      if (result.success) {
        return result
      }

      return { success: false }
    }

    if (left instanceof z.ZodLazy) {
      return this.findIntersectedSchemaForLazy(right, left)
    }

    return { success: false }
  }

  private findIntersectedSchemaForReadonly = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (right instanceof z.ZodReadonly) {
      const result = this.findIntersectedSchema(left, right._def.innerType)
      if (result.success) {
        return result
      }

      return { success: false }
    }

    if (left instanceof z.ZodReadonly) {
      return this.findIntersectedSchemaForReadonly(right, left)
    }

    return { success: false }
  }

  private findIntersectedSchemaForPipe = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (right instanceof z.ZodPipeline) {
      const result = this.findIntersectedSchema(left, right._def.out)
      if (result.success) {
        return result
      }
    }

    if (left instanceof z.ZodPipeline) {
      return this.findIntersectedSchemaForPipe(right, left)
    }

    return { success: false }
  }

  private findIntersectedSchemaForBrand = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (right instanceof z.ZodBranded) {
      const result = this.findIntersectedSchema(left, right._def.type)
      if (result.success) {
        return result
      }
    }

    if (left instanceof z.ZodBranded) {
      return this.findIntersectedSchemaForBrand(right, left)
    }

    return { success: false }
  }

  private findIntersectedSchemaForUnknown = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (right instanceof z.ZodUnknown) {
      return { success: true, schema: left }
    }

    if (left instanceof z.ZodUnknown) {
      return this.findIntersectedSchemaForUnknown(right, left)
    }

    return { success: false }
  }

  private findIntersectedSchemaForAny = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (right instanceof z.ZodAny) {
      return { success: true, schema: left }
    }

    if (left instanceof z.ZodAny) {
      return this.findIntersectedSchemaForAny(right, left)
    }

    return { success: false }
  }

  private findIntersectedSchemaForArray = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (left instanceof z.ZodArray === false || right instanceof z.ZodArray === false) {
      return { success: false }
    }

    const result = this.findIntersectedSchema(left._def.type, right._def.type)
    if (result.success === false) {
      return { success: false }
    }

    let minLength = left._def.minLength?.value ?? null
    if (right._def.minLength !== null) {
      minLength = Math.max(minLength ?? 0, right._def.minLength.value)
    }
    let maxLength = left._def.maxLength?.value ?? null
    if (right._def.maxLength !== null) {
      maxLength = Math.min(maxLength ?? Infinity, right._def.maxLength.value)
    }
    let exactLength = left._def.exactLength?.value ?? null
    if (right._def.exactLength !== null) {
      if (exactLength !== null && exactLength !== right._def.exactLength.value) {
        return { success: false }
      }
      exactLength = right._def.exactLength.value
    }
    if (minLength !== null && exactLength !== null && minLength > exactLength) {
      return { success: false }
    }
    if (maxLength !== null && exactLength !== null && maxLength < exactLength) {
      return { success: false }
    }
    if (minLength !== null && maxLength !== null && minLength > maxLength) {
      return { success: false }
    }

    let schema = z.array(result.schema)
    if (minLength !== null) schema = schema.min(minLength)
    if (maxLength !== null) schema = schema.max(maxLength)
    if (exactLength !== null) schema = schema.length(exactLength)
    return { success: true, schema }
  }

  private findIntersectedSchemaForBigint = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (left instanceof z.ZodBigInt === false || right instanceof z.ZodBigInt === false) {
      return { success: false }
    }

    let schema = z.bigint()
    for (const check of left._def.checks) {
      switch (check.kind) {
        case 'min':
          schema = schema.min(check.value)
          break
        case 'max':
          schema = schema.max(check.value)
          break
        case 'multipleOf':
          schema = schema.multipleOf(check.value)
          break
        /* v8 ignore next 3 */
        default: {
          const _: never = check
        }
      }
    }
    for (const check of right._def.checks) {
      switch (check.kind) {
        case 'min':
          schema = schema.min(check.value)
          break
        case 'max':
          schema = schema.max(check.value)
          break
        case 'multipleOf':
          schema = schema.multipleOf(check.value)
          break
        /* v8 ignore next 3 */
        default: {
          const _: never = check
        }
      }
    }
    return { success: true, schema }
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

  private findIntersectedSchemaForDate = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (left instanceof z.ZodDate === false || right instanceof z.ZodDate === false) {
      return { success: false }
    }

    let schema = z.date()
    for (const check of left._def.checks) {
      switch (check.kind) {
        case 'min':
          schema = schema.min(new Date(check.value))
          break
        case 'max':
          schema = schema.max(new Date(check.value))
          break
        /* v8 ignore next 3 */
        default: {
          const _: never = check
        }
      }
    }
    for (const check of right._def.checks) {
      switch (check.kind) {
        case 'min':
          schema = schema.min(new Date(check.value))
          break
        case 'max':
          schema = schema.max(new Date(check.value))
          break
        /* v8 ignore next 3 */
        default: {
          const _: never = check
        }
      }
    }
    return { success: true, schema }
  }

  private findIntersectedSchemaForDiscriminatedUnion = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (left instanceof z.ZodDiscriminatedUnion === false || right instanceof z.ZodDiscriminatedUnion === false) {
      return { success: false }
    }

    if (left._def.discriminator !== right._def.discriminator) {
      return { success: false }
    }

    const leftOptions = left._def.options as z.ZodObject<any, any>[]
    const rightOptions = right._def.options as z.ZodObject<any, any>[]
    const options = [] as z.ZodObject<any, any>[]
    for (const leftOption of leftOptions) {
      const leftDiscriminatorSchema = leftOption.shape[left._def.discriminator]
      if (leftDiscriminatorSchema instanceof z.ZodLiteral) {
        for (const rightOption of rightOptions) {
          const rightDiscriminatorSchema = rightOption.shape[right._def.discriminator]
          if (
            rightDiscriminatorSchema instanceof z.ZodLiteral &&
            leftDiscriminatorSchema._def.value === rightDiscriminatorSchema._def.value
          ) {
            const result = this.findIntersectedSchema(leftOption, rightOption)
            if (result.success) {
              if (result.schema instanceof z.ZodObject) {
                options.push(result.schema)
              }
            }
          }
        }
      }
    }
    if (options.length === 0) {
      return { success: false }
    }

    return { success: true, schema: z.discriminatedUnion(left._def.discriminator, options as any) }
  }

  private findIntersectedSchemaForDiscriminatedUnionAndObject = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (left instanceof z.ZodObject && right instanceof z.ZodDiscriminatedUnion) {
      const leftDiscriminatedUnionOptions = [] as z.ZodObject<any, any>[]
      for (const rightOption of right._def.options) {
        const result = left.shape[right._def.discriminator].safeParse(fake(rightOption.shape[right._def.discriminator]))
        if (result.success) {
          leftDiscriminatedUnionOptions.push(
            left.merge(
              z.object({
                [right._def.discriminator]: rightOption.shape[right._def.discriminator],
              }),
            ),
          )
        }
      }
      if (leftDiscriminatedUnionOptions.length) {
        const left = z.discriminatedUnion(right._def.discriminator, leftDiscriminatedUnionOptions as any)
        const result = this.findIntersectedSchema(left, right)
        if (result.success) {
          return { success: true, schema: result.schema }
        }
      }
    }

    if (left instanceof z.ZodDiscriminatedUnion && right instanceof z.ZodObject) {
      return this.findIntersectedSchemaForDiscriminatedUnionAndObject(right, left)
    }

    return { success: false }
  }

  private findIntersectedSchemaForDiscriminatedUnionAndRecord = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (left instanceof z.ZodRecord && right instanceof z.ZodDiscriminatedUnion) {
      const leftDiscriminatedUnionOptions = [] as z.ZodObject<any, any>[]
      for (const rightOption of right._def.options) {
        const result = this.findIntersectedSchema(left, rightOption)
        if (result.success) {
          if (result.schema instanceof z.ZodObject) {
            leftDiscriminatedUnionOptions.push(result.schema)
          }
        }
      }
      if (leftDiscriminatedUnionOptions.length) {
        const left = z.discriminatedUnion(right._def.discriminator, leftDiscriminatedUnionOptions as any)
        const result = this.findIntersectedSchema(left, right)
        if (result.success) {
          return { success: true, schema: result.schema }
        }
      }
    }

    if (left instanceof z.ZodDiscriminatedUnion && right instanceof z.ZodRecord) {
      return this.findIntersectedSchemaForDiscriminatedUnionAndRecord(right, left)
    }

    return { success: false }
  }

  private findIntersectedSchemaForEnum = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (right instanceof z.ZodEnum) {
      const values = [] as string[]
      for (const value of right._def.values) {
        if (left.safeParse(value).success) {
          values.push(value)
        }
      }
      if (typeof values.at(0) === 'string') {
        return { success: true, schema: z.enum(values as [string, ...string[]]) }
      }

      return { success: false }
    }

    if (left instanceof z.ZodEnum) {
      return this.findIntersectedSchemaForEnum(right, left)
    }

    return { success: false }
  }

  private findIntersectedSchemaForLiteral = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (right instanceof z.ZodLiteral) {
      if (left.safeParse(right._def.value).success) {
        return { success: true, schema: right }
      }

      return { success: false }
    }

    if (left instanceof z.ZodLiteral) {
      return this.findIntersectedSchemaForLiteral(right, left)
    }

    return { success: false }
  }

  private findIntersectedSchemaForNativeEnum = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (
      left instanceof z.ZodNativeEnum === false ||
      right instanceof z.ZodNativeEnum === false ||
      left.enum !== right.enum
    ) {
      return { success: false }
    }

    return { success: true, schema: left }
  }

  private findIntersectedSchemaForNumber = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (left instanceof z.ZodNumber === false || right instanceof z.ZodNumber === false) {
      return { success: false }
    }

    let schema = z.number()
    for (const check of [...left._def.checks, ...right._def.checks]) {
      switch (check.kind) {
        case 'min':
          schema = schema.min(check.value)
          break
        case 'max':
          schema = schema.max(check.value)
          break
        case 'int':
          schema = schema.int()
          break
        case 'finite':
          schema = schema.finite()
          break
        case 'multipleOf':
          schema = schema.multipleOf(check.value)
          break
        /* v8 ignore next 3 */
        default: {
          const _: never = check
        }
      }
    }
    return { success: true, schema }
  }

  private findIntersectedSchemaForObject = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (left instanceof z.ZodObject === false || right instanceof z.ZodObject === false) {
      return { success: false }
    }

    let schema = z.object({}) as z.ZodObject<any, any>
    const leftUnknownKeys = left._def.unknownKeys as UnknownKeysParam
    const rightUnknownKeys = right._def.unknownKeys as UnknownKeysParam
    const unknownKeys =
      leftUnknownKeys === 'strict' || rightUnknownKeys === 'strict'
        ? 'strict'
        : leftUnknownKeys === 'strip' || rightUnknownKeys === 'strip'
          ? 'strip'
          : 'passthrough'
    const leftCatchall = left._def.catchall
    const rightCatchall = right._def.catchall
    const catchall =
      (leftCatchall instanceof z.ZodNever && rightUnknownKeys === 'strict') ||
      (rightCatchall instanceof z.ZodNever && leftUnknownKeys === 'strict') ||
      leftUnknownKeys === 'strict' ||
      rightUnknownKeys === 'strict'
        ? z.never()
        : leftCatchall instanceof z.ZodNever
          ? rightCatchall
          : leftCatchall
    const keys = new Set([...Object.keys(left.shape), ...Object.keys(right.shape)])
    for (const key of keys) {
      const leftValue = left.shape[key]
      const rightValue = right.shape[key]
      if (leftValue === undefined) {
        if (leftCatchall instanceof z.ZodNever) {
          switch (leftUnknownKeys) {
            case 'strict':
              break
            default: {
              const _: 'strip' | 'passthrough' = leftUnknownKeys
              schema = schema.merge(z.object({ [key]: rightValue }))
            }
          }
        } else {
          const result = this.findIntersectedSchema(left._def.catchall, rightValue)
          if (result.success) {
            schema = schema.merge(z.object({ [key]: result.schema }))
          } else {
            return { success: false }
          }
        }
      } else if (rightValue === undefined) {
        if (rightCatchall instanceof z.ZodNever) {
          switch (rightUnknownKeys) {
            case 'strict':
              break
            default: {
              const _: 'strip' | 'passthrough' = rightUnknownKeys
              schema = schema.merge(z.object({ [key]: leftValue }))
            }
          }
        } else {
          const result = this.findIntersectedSchema(leftValue, right._def.catchall)
          if (result.success) {
            schema = schema.merge(z.object({ [key]: result.schema }))
          } else {
            return { success: false }
          }
        }
      } else {
        const result = this.findIntersectedSchema(leftValue, rightValue)
        if (result.success) {
          schema = schema.merge(z.object({ [key]: result.schema }))
        } else {
          return { success: false }
        }
      }
    }
    if (catchall instanceof z.ZodNever) {
      switch (unknownKeys) {
        case 'strict':
          schema = schema.strict()
          break
        case 'strip':
          schema = schema.strip()
          break
        case 'passthrough':
          schema = schema.passthrough().catchall(catchall)
          break
        /* v8 ignore next 3 */
        default: {
          const _: never = unknownKeys
        }
      }
    } else {
      schema = schema.catchall(catchall)
    }
    return { success: true, schema }
  }

  private findIntersectedSchemaForObjectAndRecord = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (left instanceof z.ZodRecord && right instanceof z.ZodObject) {
      const shape = {} as Record<string, z.ZodType>
      for (const key in right.shape) {
        shape[key] = left._def.valueType
      }
      const schema = z.object(shape)
      const result = this.findIntersectedSchema(schema, right)
      if (result.success && result.schema instanceof z.ZodObject) {
        if (right._def.catchall instanceof z.ZodNever) {
          const unknownKeys = right._def.unknownKeys as UnknownKeysParam
          switch (unknownKeys) {
            case 'strict': {
              return { success: true, schema: result.schema.strict() }
            }
            case 'strip': {
              return { success: true, schema: result.schema.strip() }
            }
            case 'passthrough': {
              return { success: true, schema: result.schema.catchall(left._def.valueType) }
            }
            /* v8 ignore next 3 */
            default: {
              const _: never = unknownKeys
            }
          }
        } else {
          const catchall = this.findIntersectedSchema(left._def.valueType, right._def.catchall)
          if (catchall.success) {
            return { success: true, schema: result.schema.catchall(catchall.schema) }
          }
        }
      }
    }

    if (left instanceof z.ZodObject && right instanceof z.ZodRecord) {
      return this.findIntersectedSchemaForObjectAndRecord(right, left)
    }

    return { success: false }
  }

  private findIntersectedSchemaForRecordWithKeyTypeString = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (left instanceof z.ZodRecord === false || right instanceof z.ZodRecord === false) {
      return { success: false }
    }

    if (left._def.keyType instanceof z.ZodString === false || right._def.keyType instanceof z.ZodString === false) {
      return { success: false }
    }

    const result = this.findIntersectedSchema(left._def.valueType, right._def.valueType)
    if (result.success === false) {
      return { success: false }
    }

    return { success: true, schema: z.record(result.schema) }
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
    const leftDedicatedCheckKinds = left._def.checks
      .map(check => check.kind)
      .filter(kind => dedicatedKinds.some(dedicatedKind => kind === dedicatedKind))
    const rightDedicatedCheckKinds = right._def.checks
      .map(check => check.kind)
      .filter(kind => dedicatedKinds.some(dedicatedKind => kind === dedicatedKind))
    if (
      leftDedicatedCheckKinds.length &&
      leftDedicatedCheckKinds.some(
        kind => rightDedicatedCheckKinds.length === 0 || rightDedicatedCheckKinds.includes(kind),
      ) === false
    ) {
      return { success: false }
    }

    return {
      success: true,
      schema: new ZodString({
        coerce: left._def.coerce || right._def.coerce,
        checks: [...left._def.checks, ...right._def.checks],
        typeName: left._def.typeName,
      }),
    }
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

  private findIntersectedSchemaForTuple = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (left instanceof z.ZodTuple === false || right instanceof z.ZodTuple === false) {
      return { success: false }
    }

    const items: z.ZodType[] = []
    let rest: z.ZodType | undefined = undefined
    for (let i = 0; i < Math.min(left._def.items.length, right._def.items.length); ++i) {
      const result = this.findIntersectedSchema(left._def.items[i], right._def.items[i])
      if (result.success) {
        items.push(result.schema)
      }
    }
    for (let i = left._def.items.length; i < right._def.items.length; ++i) {
      const result = this.findIntersectedSchema(left._def.rest, right._def.items[i])
      if (result.success) {
        items.push(result.schema)
      }
    }
    for (let i = right._def.items.length; i < left._def.items.length; ++i) {
      const result = this.findIntersectedSchema(left._def.items[i], right._def.rest)
      if (result.success) {
        items.push(result.schema)
      }
    }
    if (left._def.rest !== undefined && right._def.rest !== undefined) {
      const result = this.findIntersectedSchema(left._def.rest, right._def.rest)
      if (result.success) {
        rest = result.schema
      }
    }
    let schema: z.ZodTuple<any, any> = z.tuple(items as any)
    if (rest !== undefined) schema = schema.rest(rest)
    return { success: true, schema }
  }

  private findIntersectedSchemaForTupleAndArray = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (left instanceof z.ZodArray && right instanceof z.ZodTuple) {
      const items: z.ZodType[] = []
      for (const item of right._def.items) {
        const result = this.findIntersectedSchema(left._def.type, item)
        if (result.success) {
          items.push(result.schema)
        }
      }
      let rest: z.ZodType | undefined = undefined
      if (right._def.rest !== undefined) {
        const result = this.findIntersectedSchema(left._def.type, right._def.rest)
        if (result.success) {
          rest = result.schema
        }
      }
      let schema: z.ZodTuple<any, any> = z.tuple(items as any)
      if (rest !== undefined) schema = schema.rest(rest)
      const result = this.findIntersectedSchema(schema, right)
      if (result.success) {
        return { success: true, schema }
      }
    }

    if (left instanceof z.ZodTuple && right instanceof z.ZodArray) {
      return this.findIntersectedSchemaForTupleAndArray(right, left)
    }

    return { success: false }
  }

  private findIntersectedSchemaForUnion = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (left instanceof z.ZodUnion === false || right instanceof z.ZodUnion === false) {
      return { success: false }
    }

    let schema: z.ZodType | undefined = undefined
    for (const leftOption of left._def.options) {
      for (const rightOption of right._def.options) {
        const result = this.findIntersectedSchema(leftOption, rightOption)
        if (result.success) {
          schema = schema === undefined ? result.schema : z.union([schema, result.schema])
        }
      }
    }
    if (schema === undefined) {
      return { success: false }
    }

    return { success: true, schema }
  }

  private findIntersectedSchemaForUnionAndNonUnion = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (right instanceof z.ZodUnion && left instanceof z.ZodUnion === false) {
      return this.findIntersectedSchema(z.union([left, z.never()]), right)
    }

    if (left instanceof z.ZodUnion && right instanceof z.ZodUnion === false) {
      return this.findIntersectedSchemaForUnionAndNonUnion(right, left)
    }

    return { success: false }
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
}
