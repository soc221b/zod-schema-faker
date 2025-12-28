import * as core from 'zod/v4/core'
import { Context } from '../context'
import { rootFake as internalFake } from '../fake'
import { Infer } from '../type'

export function fakeIntersection<T extends core.$ZodIntersection>(
  schema: T,
  context: Context,
  rootFake: typeof internalFake,
): Infer<T> {
  const { left, right } = schema._zod.def

  // Handle based on left schema type following specificity order
  switch (left._zod.def.type) {
    // Most specific: never (always wins)
    case 'never':
      return handleNeverIntersection(left, right, context, rootFake)

    // Highly specific: literals and constants
    case 'literal':
      // Check if right side is more specific and should be handled first
      if (shouldSwap(left._zod.def.type, right._zod.def.type)) {
        return fakeIntersection(createIntersection(right, left), context, rootFake)
      }
      return handleLiteralIntersection(left, right, context, rootFake)
    case 'nan':
    case 'null':
    case 'undefined':
    case 'void':
      return handleConstantIntersection(left, right, context, rootFake)

    // Constrained types (more specific than primitives)
    case 'enum':
      return handleEnumIntersection(left, right, context, rootFake)
    case 'template_literal':
      return handleTemplateLiteralIntersection(left, right, context, rootFake)

    // Primitives
    case 'string':
      // Check if right side is more specific and should be handled first
      if (shouldSwap(left._zod.def.type, right._zod.def.type)) {
        return fakeIntersection(createIntersection(right, left), context, rootFake)
      }
      return handleStringIntersection(left, right, context, rootFake)
    case 'number':
      return handleNumberIntersection(left, right, context, rootFake)
    case 'bigint':
      return handleBigIntIntersection(left, right, context, rootFake)
    case 'boolean':
      return handleBooleanIntersection(left, right, context, rootFake)
    case 'date':
      return handleDateIntersection(left, right, context, rootFake)
    case 'symbol':
      return handleSymbolIntersection(left, right, context, rootFake)

    // Collections (tuple most specific)
    case 'tuple':
      return handleTupleIntersection(left, right, context, rootFake)
    case 'object':
      return handleObjectIntersection(left, right, context, rootFake)
    case 'array':
      return handleArrayIntersection(left, right, context, rootFake)
    case 'record':
      return handleRecordIntersection(left, right, context, rootFake)
    case 'map':
      return handleMapIntersection(left, right, context, rootFake)
    case 'set':
      return handleSetIntersection(left, right, context, rootFake)

    // Combinators
    case 'union':
      return handleUnionIntersection(left, right, context, rootFake)
    case 'lazy':
      return handleLazyIntersection(left, right, context, rootFake)
    case 'pipe':
      return handlePipeIntersection(left, right, context, rootFake)

    // Wrappers
    case 'optional':
    case 'nullable':
    case 'default':
    case 'readonly':
    case 'nonoptional':
      return handleWrapperIntersection(left, right, context, rootFake)

    // Error handling wrappers
    case 'catch':
      return handleCatchIntersection(left, right, context, rootFake)
    case 'prefault':
      return handlePrefaultIntersection(left, right, context, rootFake)

    // Advanced types
    case 'function':
      return handleFunctionIntersection(left, right, context, rootFake)
    case 'promise':
      return handlePromiseIntersection(left, right, context, rootFake)
    case 'file':
      return handleFileIntersection(left, right, context, rootFake)
    case 'custom':
      return handleCustomIntersection(left, right, context, rootFake)

    // Most general
    case 'unknown':
      return handleUnknownIntersection(left, right, context, rootFake)
    case 'any':
      return handleAnyIntersection(left, right, context, rootFake)

    // Future v4 types (currently TODO)
    case 'int':
    case 'success':
    case 'transform':
      throw new TypeError(`Intersection with ${left._zod.def.type} not yet supported`)

    default:
      // If right schema has more specific handling, swap and recurse
      if (shouldSwap(left._zod.def.type, right._zod.def.type)) {
        return fakeIntersection(
          createIntersection(right, left),
          context,
          rootFake
        )
      }
      // Handle generic cases or throw error for impossible intersections
      return handleGenericIntersection(left, right, context, rootFake)
  }
}

// Utility functions for intersection handling
function hasSpecificHandler(type: string): boolean {
  return getSpecificity(type) > 0
}

function getSpecificity(type: string): number {
  // Higher numbers = more specific (should be handled first)
  const specificityMap: Record<string, number> = {
    // Most specific
    'never': 100,

    // Highly specific
    'literal': 90,
    'nan': 85,
    'null': 85,
    'undefined': 85,
    'void': 85,

    // Constrained types
    'enum': 80,
    'template_literal': 75,

    // Primitives
    'string': 70,
    'number': 70,
    'bigint': 70,
    'boolean': 70,
    'date': 70,
    'symbol': 70,

    // Collections (tuple most specific)
    'tuple': 65,
    'object': 60,
    'array': 55,
    'record': 50,
    'map': 50,
    'set': 50,

    // Combinators
    'union': 45,
    'lazy': 40,
    'pipe': 40,

    // Wrappers
    'optional': 35,
    'nullable': 35,
    'default': 35,
    'readonly': 35,
    'nonoptional': 35,
    'catch': 35,
    'prefault': 35,

    // Advanced
    'function': 30,
    'promise': 30,
    'file': 30,
    'custom': 30,

    // Most general
    'unknown': 20,
    'any': 10,
  }

  return specificityMap[type] || 0
}

function shouldSwap(leftType: string, rightType: string): boolean {
  return getSpecificity(rightType) > getSpecificity(leftType)
}

function createIntersection(left: core.$ZodType, right: core.$ZodType): core.$ZodIntersection {
  // Create a new intersection schema with swapped left/right
  // We need to use Zod's intersection method
  return (left as any).and(right) as core.$ZodIntersection
}

// Handler function stubs - these will be implemented in subsequent tasks
function handleNeverIntersection(left: any, right: any, context: Context, rootFake: any): any {
  // Never intersected with anything is always impossible
  // Never represents a type that can never be instantiated
  throw new TypeError('Cannot generate fake data for intersection with never type - intersection is impossible')
}

function handleLiteralIntersection(left: any, right: any, context: Context, rootFake: any): any {
  const leftValues = left._zod.def.values

  // If right is also a literal, check if values match
  if (right._zod.def.type === 'literal') {
    const rightValues = right._zod.def.values

    // Find intersection of the two literal value arrays
    const intersection = leftValues.filter((value: any) => rightValues.includes(value))

    if (intersection.length > 0) {
      // Return one of the intersecting values
      return intersection[0]
    } else {
      // No common values - impossible intersection
      throw new TypeError(`Cannot intersect literal values [${leftValues.join(', ')}] with literal values [${rightValues.join(', ')}] - no common values`)
    }
  }

  // If right is a compatible base type, check if literal values satisfy it
  switch (right._zod.def.type) {
    case 'string':
      // Check if any literal value is a string
      const stringValues = leftValues.filter((value: any) => typeof value === 'string')
      if (stringValues.length > 0) {
        // For now, just return the first string value
        // TODO: Check string constraints when we implement string intersection
        return stringValues[0]
      }
      break
    case 'number':
      // Check if any literal value is a number
      const numberValues = leftValues.filter((value: any) => typeof value === 'number')
      if (numberValues.length > 0) {
        // For now, just return the first number value
        // TODO: Check number constraints when we implement number intersection
        return numberValues[0]
      }
      break
    case 'boolean':
      // Check if any literal value is a boolean
      const booleanValues = leftValues.filter((value: any) => typeof value === 'boolean')
      if (booleanValues.length > 0) {
        return booleanValues[0]
      }
      break
    case 'any':
      // Any accepts any literal - return first value
      return leftValues[0]
    case 'unknown':
      // Unknown accepts any literal - return first value
      return leftValues[0]
  }

  // If we get here, the literal is incompatible with the right schema
  throw new TypeError(`Cannot intersect literal values [${leftValues.join(', ')}] with ${right._zod.def.type} type - types are incompatible`)
}

function handleConstantIntersection(left: any, right: any, context: Context, rootFake: any): any {
  throw new Error('handleConstantIntersection not yet implemented')
}

function handleEnumIntersection(left: any, right: any, context: Context, rootFake: any): any {
  throw new Error('handleEnumIntersection not yet implemented')
}

function handleTemplateLiteralIntersection(left: any, right: any, context: Context, rootFake: any): any {
  throw new Error('handleTemplateLiteralIntersection not yet implemented')
}

function handleStringIntersection(left: any, right: any, context: Context, rootFake: any): any {
  throw new Error('handleStringIntersection not yet implemented')
}

function handleNumberIntersection(left: any, right: any, context: Context, rootFake: any): any {
  throw new Error('handleNumberIntersection not yet implemented')
}

function handleBigIntIntersection(left: any, right: any, context: Context, rootFake: any): any {
  throw new Error('handleBigIntIntersection not yet implemented')
}

function handleBooleanIntersection(left: any, right: any, context: Context, rootFake: any): any {
  throw new Error('handleBooleanIntersection not yet implemented')
}

function handleDateIntersection(left: any, right: any, context: Context, rootFake: any): any {
  throw new Error('handleDateIntersection not yet implemented')
}

function handleSymbolIntersection(left: any, right: any, context: Context, rootFake: any): any {
  throw new Error('handleSymbolIntersection not yet implemented')
}

function handleTupleIntersection(left: any, right: any, context: Context, rootFake: any): any {
  throw new Error('handleTupleIntersection not yet implemented')
}

function handleObjectIntersection(left: any, right: any, context: Context, rootFake: any): any {
  throw new Error('handleObjectIntersection not yet implemented')
}

function handleArrayIntersection(left: any, right: any, context: Context, rootFake: any): any {
  throw new Error('handleArrayIntersection not yet implemented')
}

function handleRecordIntersection(left: any, right: any, context: Context, rootFake: any): any {
  throw new Error('handleRecordIntersection not yet implemented')
}

function handleMapIntersection(left: any, right: any, context: Context, rootFake: any): any {
  throw new Error('handleMapIntersection not yet implemented')
}

function handleSetIntersection(left: any, right: any, context: Context, rootFake: any): any {
  throw new Error('handleSetIntersection not yet implemented')
}

function handleUnionIntersection(left: any, right: any, context: Context, rootFake: any): any {
  throw new Error('handleUnionIntersection not yet implemented')
}

function handleLazyIntersection(left: any, right: any, context: Context, rootFake: any): any {
  throw new Error('handleLazyIntersection not yet implemented')
}

function handlePipeIntersection(left: any, right: any, context: Context, rootFake: any): any {
  throw new Error('handlePipeIntersection not yet implemented')
}

function handleWrapperIntersection(left: any, right: any, context: Context, rootFake: any): any {
  throw new Error('handleWrapperIntersection not yet implemented')
}

function handleCatchIntersection(left: any, right: any, context: Context, rootFake: any): any {
  throw new Error('handleCatchIntersection not yet implemented')
}

function handlePrefaultIntersection(left: any, right: any, context: Context, rootFake: any): any {
  throw new Error('handlePrefaultIntersection not yet implemented')
}

function handleFunctionIntersection(left: any, right: any, context: Context, rootFake: any): any {
  throw new Error('handleFunctionIntersection not yet implemented')
}

function handlePromiseIntersection(left: any, right: any, context: Context, rootFake: any): any {
  throw new Error('handlePromiseIntersection not yet implemented')
}

function handleFileIntersection(left: any, right: any, context: Context, rootFake: any): any {
  throw new Error('handleFileIntersection not yet implemented')
}

function handleCustomIntersection(left: any, right: any, context: Context, rootFake: any): any {
  throw new Error('handleCustomIntersection not yet implemented')
}

function handleUnknownIntersection(left: any, right: any, context: Context, rootFake: any): any {
  throw new Error('handleUnknownIntersection not yet implemented')
}

function handleAnyIntersection(left: any, right: any, context: Context, rootFake: any): any {
  throw new Error('handleAnyIntersection not yet implemented')
}

function handleGenericIntersection(left: any, right: any, context: Context, rootFake: any): any {
  throw new Error('handleGenericIntersection not yet implemented')
}