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
      if (shouldSwap(left._zod.def.type, right._zod.def.type)) {
        return fakeIntersection(createIntersection(right, left), context, rootFake)
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
    never: 100,

    // Highly specific
    literal: 90,
    nan: 85,
    null: 85,
    undefined: 85,
    void: 85,

    // Constrained types
    enum: 80,
    template_literal: 75,

    // Primitives
    string: 70,
    number: 70,
    bigint: 70,
    boolean: 70,
    date: 70,
    symbol: 70,

    // Collections (tuple most specific)
    tuple: 65,
    object: 60,
    array: 55,
    record: 50,
    map: 50,
    set: 50,

    // Combinators
    union: 45,
    lazy: 40,
    pipe: 40,

    // Wrappers
    optional: 35,
    nullable: 35,
    default: 35,
    readonly: 35,
    nonoptional: 35,
    catch: 35,
    prefault: 35,

    // Advanced
    function: 30,
    promise: 30,
    file: 30,
    custom: 30,

    // Most general
    unknown: 20,
    any: 10,
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
      throw new TypeError(
        `Cannot intersect literal values [${leftValues.join(', ')}] with literal values [${rightValues.join(', ')}] - no common values`,
      )
    }
  }

  // If right is a compatible base type, check if literal values satisfy it
  switch (right._zod.def.type) {
    case 'template_literal':
      // Check if any literal value could match the template pattern
      // For now, we'll do a simple pattern validation
      const templateParts = right._zod.def.parts
      const stringLiterals = leftValues.filter((value: any) => typeof value === 'string')

      if (stringLiterals.length > 0) {
        // Simple pattern matching: check if literal could fit the template
        // This is a simplified approach - a full implementation would need proper regex matching
        for (const literal of stringLiterals) {
          // For templates like ['hello-', ''], check if literal starts with 'hello-'
          if (templateParts.length >= 1 && templateParts[0]) {
            if (literal.startsWith(templateParts[0])) {
              return literal
            }
          } else {
            // If no specific pattern, accept any string literal
            return literal
          }
        }
        // If no literal matches the pattern, throw error
        throw new TypeError(
          `Cannot intersect literal values [${stringLiterals.join(', ')}] with template_literal - literal does not match template pattern`,
        )
      }
      break
    case 'enum':
      // Check if any literal value is in the enum
      const enumEntries = right._zod.def.entries
      const enumValues = Object.values(enumEntries)
      const compatibleLiterals = leftValues.filter((value: any) => enumValues.includes(value))
      if (compatibleLiterals.length > 0) {
        return compatibleLiterals[0]
      }
      break
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
  throw new TypeError(
    `Cannot intersect literal values [${leftValues.join(', ')}] with ${right._zod.def.type} type - types are incompatible`,
  )
}

function handleConstantIntersection(left: any, right: any, context: Context, rootFake: any): any {
  const leftType = left._zod.def.type

  // Get the constant value for the left schema
  let constantValue: any
  switch (leftType) {
    case 'nan':
      constantValue = NaN
      break
    case 'null':
      constantValue = null
      break
    case 'undefined':
      constantValue = undefined
      break
    case 'void':
      constantValue = undefined // void returns undefined
      break
    default:
      throw new TypeError(`Unknown constant type: ${leftType}`)
  }

  // Handle intersection with right schema
  const rightType = right._zod.def.type

  // If right is the same constant type, return the constant value
  if (rightType === leftType) {
    return constantValue
  }

  // Handle intersection with compatible types
  switch (rightType) {
    case 'any':
    case 'unknown':
      // Any and unknown accept any constant value
      return constantValue

    case 'number':
      // Only NaN can intersect with number (NaN is a number in JavaScript)
      if (leftType === 'nan') {
        // Check if NaN satisfies any number constraints
        // For now, we assume NaN is valid for any number schema
        // TODO: When implementing number intersection, check constraints
        return constantValue
      }
      break

    case 'string':
      // Constants cannot intersect with string
      throw new TypeError(`Cannot intersect ${leftType} with string`)

    case 'boolean':
      // Constants cannot intersect with boolean
      throw new TypeError(`Cannot intersect ${leftType} with boolean`)

    case 'object':
      // Constants cannot intersect with object
      throw new TypeError(`Cannot intersect ${leftType} with object`)

    case 'array':
      // Constants cannot intersect with array
      throw new TypeError(`Cannot intersect ${leftType} with array`)

    case 'literal':
      // Check if the constant value matches any of the literal values
      const literalValues = right._zod.def.values
      if (literalValues.includes(constantValue)) {
        return constantValue
      }
      throw new TypeError(
        `Cannot intersect ${leftType} with literal values [${literalValues.join(', ')}] - constant value not in literal set`,
      )

    // For other constant types, check compatibility
    case 'nan':
    case 'null':
    case 'undefined':
    case 'void':
      // Different constant types cannot intersect
      throw new TypeError(`Cannot intersect ${leftType} with ${rightType}`)

    default:
      // For unhandled types, assume incompatible
      throw new TypeError(`Cannot intersect ${leftType} with ${rightType}`)
  }

  // If we reach here, the intersection is incompatible
  throw new TypeError(`Cannot intersect ${leftType} with ${rightType}`)
}

function handleEnumIntersection(left: any, right: any, context: Context, rootFake: any): any {
  // Get the enum values from the left schema (v4 uses entries object)
  const leftEntries = left._zod.def.entries
  const leftValues = Object.values(leftEntries)

  // Handle intersection with right schema
  const rightType = right._zod.def.type

  switch (rightType) {
    case 'enum':
      // Intersect two enums - find common values
      const rightEntries = right._zod.def.entries
      const rightValues = Object.values(rightEntries)
      const commonValues = leftValues.filter((value: any) => rightValues.includes(value))

      if (commonValues.length > 0) {
        // Return a random value from the common values
        const randomIndex = Math.floor(Math.random() * commonValues.length)
        return commonValues[randomIndex]
      } else {
        // No common values - impossible intersection
        throw new TypeError(
          `Cannot intersect enum values [${leftValues.join(', ')}] with enum values [${rightValues.join(', ')}] - no common values`,
        )
      }

    case 'literal':
      // Check if the literal value is in the enum
      const literalValues = right._zod.def.values
      const compatibleValues = literalValues.filter((value: any) => leftValues.includes(value))

      if (compatibleValues.length > 0) {
        // Return the literal value since it's in the enum
        return compatibleValues[0]
      } else {
        throw new TypeError(
          `Cannot intersect enum values [${leftValues.join(', ')}] with literal values [${literalValues.join(', ')}] - literal not in enum`,
        )
      }

    case 'string':
      // Enum values are strings, so this should work
      // Return a random enum value (all enum values are strings)
      const randomIndex = Math.floor(Math.random() * leftValues.length)
      return leftValues[randomIndex]

    case 'any':
    case 'unknown':
      // Any and unknown accept any enum value
      const anyRandomIndex = Math.floor(Math.random() * leftValues.length)
      return leftValues[anyRandomIndex]

    case 'number':
    case 'boolean':
    case 'object':
    case 'array':
      // Enum values are strings, so these types are incompatible
      throw new TypeError(`Cannot intersect enum with ${rightType} - enum values are strings`)

    // For constant types, check if any enum value matches
    case 'null':
    case 'undefined':
    case 'void':
    case 'nan':
      // These constants cannot match string enum values
      throw new TypeError(`Cannot intersect enum with ${rightType} - enum values are strings`)

    default:
      // For unhandled types, assume incompatible
      throw new TypeError(`Cannot intersect enum with ${rightType}`)
  }
}

function handleTemplateLiteralIntersection(left: any, right: any, context: Context, rootFake: any): any {
  // Handle intersection with right schema
  const rightType = right._zod.def.type

  switch (rightType) {
    case 'template_literal':
      // Intersect two template literals - this is complex and generally impossible
      // unless they have identical patterns
      const leftParts = left._zod.def.parts
      const rightParts = right._zod.def.parts

      // For simplicity, only allow identical template literals
      if (JSON.stringify(leftParts) === JSON.stringify(rightParts)) {
        // Generate a simple value from the template literal without recursion
        return 'template-literal-value'
      } else {
        // Different template patterns cannot be intersected
        throw new TypeError('Cannot intersect template literal patterns - patterns are incompatible')
      }

    case 'literal':
      // Check if the literal value matches the template pattern
      const literalValues = right._zod.def.values

      // For now, we'll do a simple check - in a real implementation,
      // we'd need to validate the literal against the template pattern
      // This is a simplified approach
      for (const literalValue of literalValues) {
        if (typeof literalValue === 'string') {
          // Check if literal could match template pattern
          // For now, just check if it starts with the first string part
          const leftParts = left._zod.def.parts
          const firstStringPart = leftParts.find((part: any) => typeof part === 'string')
          if (firstStringPart && literalValue.includes(firstStringPart)) {
            return literalValue
          }
        }
      }

      throw new TypeError(
        `Cannot intersect template literal with literal values [${literalValues.join(', ')}] - literal does not match template pattern`,
      )

    case 'string':
      // Template literal generates strings, so this should work
      // Return a simple value without recursion
      return 'template-string-value'

    case 'any':
    case 'unknown':
      // Any and unknown accept any template literal value
      return 'template-any-value'

    case 'number':
    case 'boolean':
    case 'object':
    case 'array':
      // Template literals generate strings, so these types are incompatible
      throw new TypeError(`Cannot intersect template literal with ${rightType} - template literals generate strings`)

    // For constant types, check compatibility
    case 'null':
    case 'undefined':
    case 'void':
    case 'nan':
      // These constants cannot match string template literal values
      throw new TypeError(`Cannot intersect template literal with ${rightType} - template literals generate strings`)

    default:
      // For unhandled types, assume incompatible
      throw new TypeError(`Cannot intersect template literal with ${rightType}`)
  }
}

function handleStringIntersection(left: any, right: any, context: Context, rootFake: any): any {
  const rightType = right._zod.def.type

  switch (rightType) {
    case 'string':
      // Intersect two string schemas - merge constraints
      const leftConstraints = extractStringConstraints(left)
      const rightConstraints = extractStringConstraints(right)

      // Merge constraints
      const mergedMin = Math.max(leftConstraints.min || 0, rightConstraints.min || 0)
      const mergedMax = Math.min(
        leftConstraints.max === undefined ? Infinity : leftConstraints.max,
        rightConstraints.max === undefined ? Infinity : rightConstraints.max,
      )

      // Check for impossible constraints
      if (mergedMin > mergedMax) {
        throw new TypeError(
          `Cannot intersect string constraints - min length (${mergedMin}) is greater than max length (${mergedMax})`,
        )
      }

      // Generate a string that satisfies the merged constraints
      const targetLength = Math.floor(Math.random() * (mergedMax - mergedMin + 1)) + mergedMin
      let result = ''
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 '

      for (let i = 0; i < targetLength; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }

      return result

    case 'literal':
      // Check if the literal value is a string and satisfies string constraints
      const literalValues = right._zod.def.values
      const stringLiterals = literalValues.filter((value: any) => typeof value === 'string')

      if (stringLiterals.length > 0) {
        // Check if any string literal satisfies the string constraints
        for (const literal of stringLiterals) {
          if (satisfiesStringConstraints(literal, left)) {
            return literal
          }
        }
        // If no literal satisfies constraints, throw error
        throw new TypeError(
          `Cannot intersect string constraints with literal values [${stringLiterals.join(', ')}] - literals do not satisfy string constraints`,
        )
      } else {
        throw new TypeError(
          `Cannot intersect string with literal values [${literalValues.join(', ')}] - literals are not strings`,
        )
      }

    case 'enum':
      // Enum values are strings, so this should work
      const enumEntries = right._zod.def.entries
      const enumValues = Object.values(enumEntries)

      // Check if any enum value satisfies the string constraints
      for (const enumValue of enumValues) {
        if (typeof enumValue === 'string' && satisfiesStringConstraints(enumValue, left)) {
          return enumValue
        }
      }

      // If no enum value satisfies constraints, throw error
      throw new TypeError(
        `Cannot intersect string constraints with enum values [${enumValues.join(', ')}] - no enum value satisfies string constraints`,
      )

    case 'template_literal':
      // Template literal generates strings, so generate from template and check constraints
      // For now, just generate a simple string that satisfies constraints
      const templateConstraints = extractStringConstraints(left)
      const templateMinLength = templateConstraints.min || 1
      const templateMaxLength = templateConstraints.max || 10
      const templateTargetLength =
        Math.floor(Math.random() * (templateMaxLength - templateMinLength + 1)) + templateMinLength

      let templateResult = 'template'
      if (templateResult.length < templateTargetLength) {
        templateResult = templateResult.padEnd(templateTargetLength, 'x')
      } else if (templateResult.length > templateTargetLength) {
        templateResult = templateResult.slice(0, templateTargetLength)
      }

      return templateResult

    case 'any':
    case 'unknown':
      // Any and unknown accept any string - generate string satisfying constraints
      const anyConstraints = extractStringConstraints(left)
      const anyMinLength = anyConstraints.min || 1
      const anyMaxLength = anyConstraints.max || 10
      const anyTargetLength = Math.floor(Math.random() * (anyMaxLength - anyMinLength + 1)) + anyMinLength

      let anyResult = ''
      const anyChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 '

      for (let i = 0; i < anyTargetLength; i++) {
        anyResult += anyChars.charAt(Math.floor(Math.random() * anyChars.length))
      }

      return anyResult

    case 'number':
    case 'boolean':
    case 'object':
    case 'array':
    case 'bigint':
    case 'date':
    case 'symbol':
      // These types cannot intersect with string
      throw new TypeError(`Cannot intersect string with ${rightType}`)

    // For constant types, check compatibility
    case 'null':
    case 'undefined':
    case 'void':
    case 'nan':
      // These constants cannot intersect with string
      throw new TypeError(`Cannot intersect string with ${rightType}`)

    default:
      // For unhandled types, assume incompatible
      throw new TypeError(`Cannot intersect string with ${rightType}`)
  }
}

// Helper function to merge constraints from two string schemas
// Helper function to extract constraints from a string schema
function extractStringConstraints(stringSchema: any): { min?: number; max?: number } {
  let min: number | undefined
  let max: number | undefined

  const checks = stringSchema._zod.def.checks || []
  for (const check of checks) {
    switch (check._zod.def.check) {
      case 'length_equals':
        min = check._zod.def.length
        max = check._zod.def.length
        break
      case 'min_length':
        min = Math.max(min || 0, check._zod.def.minimum)
        break
      case 'max_length':
        max = Math.min(max === undefined ? check._zod.def.maximum : max, check._zod.def.maximum)
        break
    }
  }

  return { min, max }
}

// Helper function to check if a string satisfies string schema constraints
function satisfiesStringConstraints(value: string, stringSchema: any): boolean {
  const constraints = extractStringConstraints(stringSchema)

  if (constraints.min !== undefined && value.length < constraints.min) {
    return false
  }

  if (constraints.max !== undefined && value.length > constraints.max) {
    return false
  }

  return true
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
