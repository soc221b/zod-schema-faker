import { UnknownKeysParam, z } from 'zod'
import { fake } from './fake'
import { ZodTypeFaker } from './zod-type-faker'
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
      this.findIntersectedSchemaForPipe,

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
      this.findIntersectedSchemaForDiscriminatedUnion,
      this.findIntersectedSchemaForNumber,
      this.findIntersectedSchemaForString,
      this.findIntersectedSchemaForVoid,
      this.findIntersectedSchemaForSymbol,
      this.findIntersectedSchemaForNativeEnum,
      this.findIntersectedSchemaForEnum,
      this.findIntersectedSchemaForLiteral,
      this.findIntersectedSchemaForBoolean,
      this.findIntersectedSchemaForBigint,
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
        const result2 = this.findIntersectedSchema(result.schema, right)
        if (result2.success) {
          return { success: true, schema: result2.schema }
        }
      }
    } else if (right instanceof z.ZodIntersection) {
      const result = this.findIntersectedSchema(right._def.left, right._def.right)
      if (result.success) {
        const result2 = this.findIntersectedSchema(left, result.schema)
        if (result2.success) {
          return { success: true, schema: result2.schema }
        }
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

  private findIntersectedSchemaForPipe = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (left instanceof z.ZodPipeline) {
      const result = this.findIntersectedSchema(left._def.out, right)
      if (result.success) {
        return result
      }
    } else if (right instanceof z.ZodPipeline) {
      const result = this.findIntersectedSchema(left, right._def.out)
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

    let min = undefined
    let max = undefined
    for (let check of left._def.checks) {
      switch (check.kind) {
        case 'min':
          min = check.value
          break
        case 'max':
          max = check.value
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
        default: {
          const _: never = check
        }
      }
    }

    let schema = z.date()
    if (min !== undefined) schema = schema.min(new Date(min))
    if (max !== undefined) schema = schema.max(new Date(max))
    return { success: true, schema }
  }

  private findIntersectedSchemaForArray = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (left instanceof z.ZodArray === false || right instanceof z.ZodArray === false) {
      return { success: false }
    }

    let minLength = left._def.minLength?.value ?? null
    let maxLength = left._def.maxLength?.value ?? null
    let exactLength = left._def.exactLength?.value ?? null
    if (right._def.minLength !== null) {
      minLength = Math.max(minLength ?? 0, right._def.minLength.value)
    }
    if (right._def.maxLength !== null) {
      maxLength = Math.min(maxLength ?? Infinity, right._def.maxLength.value)
    }
    if (right._def.exactLength !== null) {
      exactLength = right._def.exactLength.value
    }
    const result = this.findIntersectedSchema(left._def.type, right._def.type)
    if (result.success === false) {
      return { success: false }
    }
    let schema = z.array(result.schema)
    if (minLength !== null) schema = schema.min(minLength)
    if (maxLength !== null) schema = schema.max(maxLength)
    if (exactLength !== null) schema = schema.length(exactLength)
    return { success: true, schema }
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
          const result = this.findIntersectedSchema(left._def.catchall, rightValue)
          if (result.success) {
            schema = schema.merge(z.object({ [key]: result.schema }))
          } else {
            return { success: false }
          }
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
    return { success: true, schema }
  }

  private findIntersectedSchemaForRecord = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (left instanceof z.ZodRecord === false || right instanceof z.ZodRecord === false) {
      return { success: false }
    }

    const result = this.findIntersectedSchema(left._def.valueType, right._def.valueType)
    if (result.success === false) {
      return { success: false }
    }

    return { success: true, schema: z.record(result.schema) }
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

  private findIntersectedSchemaForUnion = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (left instanceof z.ZodUnion || right instanceof z.ZodUnion) {
      if (left instanceof z.ZodUnion === false) {
        left = z.union([left, z.never()])
      }
      if (right instanceof z.ZodUnion === false) {
        right = z.union([right, z.never()])
      }
    }
    if (left instanceof z.ZodUnion === false || right instanceof z.ZodUnion === false) {
      return { success: false }
    }

    let schema: z.ZodType | undefined = undefined
    for (let leftOption of left._def.options) {
      for (let rightOption of right._def.options) {
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

  private findIntersectedSchemaForDiscriminatedUnion = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (left instanceof z.ZodDiscriminatedUnion || right instanceof z.ZodDiscriminatedUnion) {
      if (left instanceof z.ZodObject && right instanceof z.ZodDiscriminatedUnion) {
        const leftDiscriminatedUnionOptions = [] as z.ZodObject<any, any>[]
        for (let rightOption of right._def.options) {
          const result = left.shape[right._def.discriminator].safeParse(
            fake(rightOption.shape[right._def.discriminator]),
          )
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
        if (leftDiscriminatedUnionOptions.length === 0) {
          return { success: false }
        }
        left = z.discriminatedUnion(right._def.discriminator, leftDiscriminatedUnionOptions as any)
      }
      if (right instanceof z.ZodObject && left instanceof z.ZodDiscriminatedUnion) {
        const rightDiscriminatedUnionOptions = [] as z.ZodObject<any, any>[]
        for (let leftOption of left._def.options) {
          const result = right.shape[left._def.discriminator].safeParse(fake(leftOption.shape[left._def.discriminator]))
          if (result.success) {
            rightDiscriminatedUnionOptions.push(
              right.merge(
                z.object({
                  [left._def.discriminator]: leftOption.shape[left._def.discriminator],
                }),
              ),
            )
          }
        }
        if (rightDiscriminatedUnionOptions.length === 0) {
          return { success: false }
        }
        right = z.discriminatedUnion(left._def.discriminator, rightDiscriminatedUnionOptions as any)
      }
    }
    if (left instanceof z.ZodDiscriminatedUnion === false || right instanceof z.ZodDiscriminatedUnion === false) {
      return { success: false }
    }

    if (left._def.discriminator !== right._def.discriminator) {
      return { success: false }
    }

    const leftOptions = left._def.options as z.ZodObject<any, any>[]
    const rightOptions = right._def.options as z.ZodObject<any, any>[]
    const options = [] as z.ZodObject<any, any>[]
    for (let leftOption of leftOptions) {
      const leftDiscriminatorSchema = leftOption.shape[left._def.discriminator] as z.ZodLiteral<any>
      for (let rightOption of rightOptions) {
        const rightDiscriminatorSchema = rightOption.shape[right._def.discriminator] as z.ZodLiteral<any>

        if (leftDiscriminatorSchema._def.value === rightDiscriminatorSchema._def.value) {
          const result = this.findIntersectedSchema(leftOption, rightOption)
          if (result.success) {
            if (result.schema instanceof z.ZodObject) {
              options.push(result.schema)
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

    let schema = z.number()
    if (min !== -Infinity) schema = schema.min(min)
    if (max !== Infinity) schema = schema.max(max)
    if (finite) schema = schema.finite()
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
          min = Math.max(min ?? check.value, check.value)
          break
        case 'max':
          max = Math.min(max ?? check.value, check.value)
          break
        case 'length':
          min = Math.max(min ?? check.value, check.value)
          max = Math.min(max ?? check.value, check.value)
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
    if (
      left instanceof z.ZodNativeEnum === false ||
      right instanceof z.ZodNativeEnum === false ||
      left._def.values !== right._def.values
    ) {
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
    if (sharedValues.length === 0) {
      return { success: false }
    }

    return { success: true, schema: z.enum(sharedValues) }
  }

  private findIntersectedSchemaForLiteral = (
    left: z.ZodType,
    right: z.ZodType,
  ): { success: true; schema: z.ZodType } | { success: false } => {
    if (
      left instanceof z.ZodLiteral === false ||
      right instanceof z.ZodLiteral === false ||
      left._def.value !== right._def.value
    ) {
      return { success: false }
    }

    return { success: true, schema: left }
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

  private findIntersectedSchemaForBigint = (
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
