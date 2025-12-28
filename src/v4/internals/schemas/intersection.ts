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
      if (hasSpecificHandler(right._zod.def.type)) {
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
  const specificTypes = [
    'never', 'literal', 'nan', 'null', 'undefined', 'void',
    'enum', 'template_literal', 'string', 'number', 'bigint',
    'boolean', 'date', 'symbol', 'tuple', 'object', 'array',
    'record', 'map', 'set', 'union', 'lazy', 'pipe'
  ]
  return specificTypes.includes(type)
}

function createIntersection(left: core.$ZodType, right: core.$ZodType): core.$ZodIntersection {
  // This would need to use Zod's internal intersection creation
  // For now, we'll throw an error as this is a placeholder
  throw new Error('createIntersection not yet implemented')
}

// Handler function stubs - these will be implemented in subsequent tasks
function handleNeverIntersection(left: any, right: any, context: Context, rootFake: any): any {
  throw new Error('handleNeverIntersection not yet implemented')
}

function handleLiteralIntersection(left: any, right: any, context: Context, rootFake: any): any {
  throw new Error('handleLiteralIntersection not yet implemented')
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