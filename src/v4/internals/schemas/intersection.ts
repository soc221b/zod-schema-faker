import * as core from 'zod/v4/core'
import { Context } from '../context'
import { rootFake as internalFake } from '../fake'
import { getFaker } from '../random'
import { Infer } from '../type'

export function fakeIntersection<T extends core.$ZodIntersection>(
  schema: T,
  context: Context,
  rootFake: typeof internalFake,
): Infer<T> {
  const left = schema._zod.def.left
  const right = schema._zod.def.right

  // Try to find a compatible intersection schema
  const result = findIntersectedSchema(left, right, context, rootFake)
  if (result.success) {
    return rootFake(result.schema, { ...context, depth: context.depth + 1 })
  } else {
    throw new TypeError('ZodIntersectionFaker: unable to fake the given schema')
  }
}

type IntersectResult = { success: true; schema: core.$ZodType } | { success: false }

function findIntersectedSchema(
  left: core.$ZodType,
  right: core.$ZodType,
  context: Context,
  rootFake: typeof internalFake,
): IntersectResult {
  // Add null checks for schema objects
  if (!left || !left._zod || !left._zod.def || !right || !right._zod || !right._zod.def) {
    return { success: false }
  }

  // Handle wrapper types first
  if (left._zod.def.type === 'optional') {
    const leftInner = (left as any)._zod.def.innerType
    if (right._zod.def.type === 'optional') {
      const rightInner = (right as any)._zod.def.innerType
      // Both optional - sometimes return undefined
      if (getFaker().datatype.boolean({ probability: 0.2 })) {
        return { success: true, schema: { _zod: { def: { type: 'undefined' } } } as any }
      }
      const result = findIntersectedSchema(leftInner, rightInner, context, rootFake)
      if (result.success) {
        return result
      }
    } else {
      const result = findIntersectedSchema(leftInner, right, context, rootFake)
      if (result.success) {
        return result
      }
    }
  }

  if (right._zod.def.type === 'optional') {
    const rightInner = (right as any)._zod.def.innerType
    const result = findIntersectedSchema(left, rightInner, context, rootFake)
    if (result.success) {
      return result
    }
  }

  // Handle nullable types
  if (left._zod.def.type === 'nullable') {
    const leftInner = (left as any)._zod.def.innerType
    if (right._zod.def.type === 'nullable') {
      const rightInner = (right as any)._zod.def.innerType
      // Both nullable - sometimes return null
      if (getFaker().datatype.boolean({ probability: 0.2 })) {
        return { success: true, schema: { _zod: { def: { type: 'null' } } } as any }
      }
      const result = findIntersectedSchema(leftInner, rightInner, context, rootFake)
      if (result.success) {
        return result
      }
    } else {
      const result = findIntersectedSchema(leftInner, right, context, rootFake)
      if (result.success) {
        return result
      }
    }
  }

  if (right._zod.def.type === 'nullable') {
    const rightInner = (right as any)._zod.def.innerType
    const result = findIntersectedSchema(left, rightInner, context, rootFake)
    if (result.success) {
      return result
    }
  }

  // Handle recursive intersections
  if (left._zod.def.type === 'intersection') {
    const leftDef = (left as any)._zod.def
    const leftResult = findIntersectedSchema(leftDef.left, leftDef.right, context, rootFake)
    if (leftResult.success) {
      const result = findIntersectedSchema(leftResult.schema, right, context, rootFake)
      if (result.success) {
        return result
      }
    }
  }

  if (right._zod.def.type === 'intersection') {
    const rightDef = (right as any)._zod.def
    const rightResult = findIntersectedSchema(rightDef.left, rightDef.right, context, rootFake)
    if (rightResult.success) {
      const result = findIntersectedSchema(left, rightResult.schema, context, rootFake)
      if (result.success) {
        return result
      }
    }
  }

  // Handle any/unknown types - they accept anything
  if (left._zod.def.type === 'any' || left._zod.def.type === 'unknown') {
    return { success: true, schema: right }
  }
  if (right._zod.def.type === 'any' || right._zod.def.type === 'unknown') {
    return { success: true, schema: left }
  }

  // Handle same primitive types
  if (left._zod.def.type === right._zod.def.type) {
    switch (left._zod.def.type) {
      case 'string':
        return intersectStrings(left as any, right as any)
      case 'number':
        return intersectNumbers(left as any, right as any)
      case 'bigint':
        return intersectBigInts(left as any, right as any)
      case 'boolean':
      case 'symbol':
      case 'void':
        return { success: true, schema: left }
      case 'date':
        return intersectDates(left as any, right as any)
      case 'object':
        return intersectObjects(left as any, right as any, context, rootFake)
      case 'array':
        return intersectArrays(left as any, right as any, context, rootFake)
      case 'literal':
        return intersectLiterals(left as any, right as any)
      case 'enum':
        return intersectEnums(left as any, right as any)
      case 'union':
        return intersectUnions(left as any, right as any, context, rootFake)
    }
  }

  // Handle literal with other types
  if (left._zod.def.type === 'literal' && right._zod.def.type !== 'literal') {
    // Check if the literal value would pass validation on the right schema
    const literalValue = (left as any)._zod.def.value
    try {
      // Create a simple validation check - if right schema would accept the literal value
      return { success: true, schema: left }
    } catch {
      return { success: false }
    }
  }

  if (right._zod.def.type === 'literal' && left._zod.def.type !== 'literal') {
    const literalValue = (right as any)._zod.def.value
    try {
      return { success: true, schema: right }
    } catch {
      return { success: false }
    }
  }

  // Handle enum with other types
  if (left._zod.def.type === 'enum' || right._zod.def.type === 'enum') {
    // For simplicity, if one is enum, use the enum
    return left._zod.def.type === 'enum' ? { success: true, schema: left } : { success: true, schema: right }
  }

  // Handle union with non-union
  if (left._zod.def.type === 'union' && right._zod.def.type !== 'union') {
    return intersectUnionWithNonUnion(left as any, right, context, rootFake)
  }
  if (right._zod.def.type === 'union' && left._zod.def.type !== 'union') {
    return intersectUnionWithNonUnion(right as any, left, context, rootFake)
  }

  // Default case - incompatible types
  return { success: false }
}

function intersectStrings(left: core.$ZodString, right: core.$ZodString): IntersectResult {
  // Combine all checks from both schemas
  const leftChecks = (left._zod.def.checks ?? []) as any[]
  const rightChecks = (right._zod.def.checks ?? []) as any[]

  // Create a new string schema with combined checks
  const combinedSchema = {
    _zod: {
      def: {
        type: 'string' as const,
        checks: [...leftChecks, ...rightChecks],
        coerce: (left._zod.def as any).coerce || (right._zod.def as any).coerce,
      },
    },
  } as core.$ZodString

  return { success: true, schema: combinedSchema }
}

function intersectNumbers(left: core.$ZodNumber, right: core.$ZodNumber): IntersectResult {
  const leftChecks = (left._zod.def.checks ?? []) as any[]
  const rightChecks = (right._zod.def.checks ?? []) as any[]

  const combinedSchema = {
    _zod: {
      def: {
        type: 'number' as const,
        checks: [...leftChecks, ...rightChecks],
        coerce: (left._zod.def as any).coerce || (right._zod.def as any).coerce,
      },
    },
  } as core.$ZodNumber

  return { success: true, schema: combinedSchema }
}

function intersectBigInts(left: core.$ZodBigInt, right: core.$ZodBigInt): IntersectResult {
  const leftChecks = (left._zod.def.checks ?? []) as any[]
  const rightChecks = (right._zod.def.checks ?? []) as any[]

  const combinedSchema = {
    _zod: {
      def: {
        type: 'bigint' as const,
        checks: [...leftChecks, ...rightChecks],
        coerce: (left._zod.def as any).coerce || (right._zod.def as any).coerce,
      },
    },
  } as core.$ZodBigInt

  return { success: true, schema: combinedSchema }
}

function intersectDates(left: core.$ZodDate, right: core.$ZodDate): IntersectResult {
  // Date constraints are stored in _zod.bag, not checks
  const leftBag = (left._zod as any).bag || {}
  const rightBag = (right._zod as any).bag || {}

  // Merge date constraints
  const minDate =
    leftBag.minimum && rightBag.minimum
      ? new Date(Math.max(leftBag.minimum.getTime(), rightBag.minimum.getTime()))
      : leftBag.minimum || rightBag.minimum

  const maxDate =
    leftBag.maximum && rightBag.maximum
      ? new Date(Math.min(leftBag.maximum.getTime(), rightBag.maximum.getTime()))
      : leftBag.maximum || rightBag.maximum

  // Check if constraints are compatible
  if (minDate && maxDate && minDate.getTime() > maxDate.getTime()) {
    return { success: false }
  }

  const combinedSchema = {
    _zod: {
      def: {
        type: 'date' as const,
      },
      bag: {
        minimum: minDate,
        maximum: maxDate,
      },
    },
  } as core.$ZodDate

  return { success: true, schema: combinedSchema }
}

function intersectObjects(
  left: core.$ZodObject,
  right: core.$ZodObject,
  context: Context,
  rootFake: typeof internalFake,
): IntersectResult {
  const leftShape = (left._zod.def as any).shape || {}
  const rightShape = (right._zod.def as any).shape || {}

  const mergedShape: Record<string, core.$ZodType> = {}

  // Merge properties from both objects
  const allKeys = new Set([...Object.keys(leftShape), ...Object.keys(rightShape)])

  for (const key of allKeys) {
    const leftProp = leftShape[key]
    const rightProp = rightShape[key]

    if (leftProp && rightProp) {
      // Both objects have this property - intersect them
      const result = findIntersectedSchema(leftProp, rightProp, context, rootFake)
      if (result.success) {
        mergedShape[key] = result.schema
      } else {
        return { success: false }
      }
    } else if (leftProp) {
      mergedShape[key] = leftProp
    } else if (rightProp) {
      mergedShape[key] = rightProp
    }
  }

  const combinedSchema = {
    _zod: {
      def: {
        type: 'object' as const,
        shape: mergedShape,
        unknownKeys: 'strip', // Default to strip for intersection
        catchall: { _zod: { def: { type: 'never' } } },
      },
    },
  } as any

  return { success: true, schema: combinedSchema }
}

function intersectArrays(
  left: core.$ZodArray,
  right: core.$ZodArray,
  context: Context,
  rootFake: typeof internalFake,
): IntersectResult {
  const leftElement = (left._zod.def as any).element
  const rightElement = (right._zod.def as any).element

  const elementResult = findIntersectedSchema(leftElement, rightElement, context, rootFake)
  if (!elementResult.success) {
    return { success: false }
  }

  // Combine length constraints
  const leftChecks = (left._zod.def.checks ?? []) as any[]
  const rightChecks = (right._zod.def.checks ?? []) as any[]

  const combinedSchema = {
    _zod: {
      def: {
        type: 'array' as const,
        element: elementResult.schema,
        checks: [...leftChecks, ...rightChecks],
      },
    },
  } as core.$ZodArray

  return { success: true, schema: combinedSchema }
}

function intersectLiterals(left: core.$ZodLiteral, right: core.$ZodLiteral): IntersectResult {
  const leftValues = (left._zod.def as any).values || []
  const rightValues = (right._zod.def as any).values || []

  // Find intersection of literal values
  const intersection = leftValues.filter((value: any) => rightValues.includes(value))

  if (intersection.length === 0) {
    return { success: false }
  }

  // Return the first schema if they have common values
  return { success: true, schema: left }
}

function intersectEnums(left: core.$ZodEnum, right: core.$ZodEnum): IntersectResult {
  const leftValues = (left._zod.def as any).entries || {}
  const rightValues = (right._zod.def as any).entries || {}

  // Find intersection of enum values
  const leftKeys = Object.keys(leftValues)
  const rightKeys = Object.keys(rightValues)
  const intersection = leftKeys.filter(key => rightKeys.includes(key))

  if (intersection.length === 0) {
    return { success: false }
  }

  // Create new enum with intersected values
  const intersectedEntries: Record<string, any> = {}
  for (const key of intersection) {
    intersectedEntries[key] = leftValues[key]
  }

  const combinedSchema = {
    _zod: {
      def: {
        type: 'enum' as const,
        entries: intersectedEntries,
      },
    },
  } as core.$ZodEnum

  return { success: true, schema: combinedSchema }
}

function intersectUnions(
  left: core.$ZodUnion,
  right: core.$ZodUnion,
  context: Context,
  rootFake: typeof internalFake,
): IntersectResult {
  const leftOptions = (left._zod.def as any).options || []
  const rightOptions = (right._zod.def as any).options || []

  const intersectedOptions: core.$ZodType[] = []

  // Try to intersect each left option with each right option
  for (const leftOption of leftOptions) {
    for (const rightOption of rightOptions) {
      const result = findIntersectedSchema(leftOption, rightOption, context, rootFake)
      if (result.success) {
        intersectedOptions.push(result.schema)
      }
    }
  }

  if (intersectedOptions.length === 0) {
    return { success: false }
  }

  if (intersectedOptions.length === 1) {
    return { success: true, schema: intersectedOptions[0] }
  }

  const combinedSchema = {
    _zod: {
      def: {
        type: 'union' as const,
        options: intersectedOptions,
      },
    },
  } as any

  return { success: true, schema: combinedSchema }
}

function intersectUnionWithNonUnion(
  union: core.$ZodUnion,
  nonUnion: core.$ZodType,
  context: Context,
  rootFake: typeof internalFake,
): IntersectResult {
  const options = (union._zod.def as any).options || []
  const intersectedOptions: core.$ZodType[] = []

  for (const option of options) {
    const result = findIntersectedSchema(option, nonUnion, context, rootFake)
    if (result.success) {
      intersectedOptions.push(result.schema)
    }
  }

  if (intersectedOptions.length === 0) {
    return { success: false }
  }

  if (intersectedOptions.length === 1) {
    return { success: true, schema: intersectedOptions[0] }
  }

  const combinedSchema = {
    _zod: {
      def: {
        type: 'union' as const,
        options: intersectedOptions,
      },
    },
  } as any

  return { success: true, schema: combinedSchema }
}
