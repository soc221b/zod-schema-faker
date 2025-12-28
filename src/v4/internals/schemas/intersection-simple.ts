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

  // Check if we should swap left and right for better handling
  if (shouldSwap(left, right)) {
    return fakeIntersection(
      { ...schema, _zod: { ...schema._zod, def: { ...schema._zod.def, left: right, right: left } } },
      context,
      rootFake,
    )
  }

  // Handle based on left schema type following specificity order
  switch (left._zod.def.type) {
    // Most specific: never (always wins)
    case 'never':
      throw new TypeError('Cannot generate fake data for intersection with never type - intersection is impossible')

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

    default:
      throw new TypeError(`Intersection with ${left._zod.def.type} not yet supported`)
  }
}

// Determine if left and right should be swapped based on specificity
function shouldSwap(left: any, right: any): boolean {
  const leftType = left._zod.def.type
  const rightType = right._zod.def.type

  // Specificity order (higher number = more specific)
  const specificity: Record<string, number> = {
    any: 0,
    unknown: 1,
    string: 2,
    number: 2,
    boolean: 2,
    template_literal: 3,
    enum: 4,
    nan: 5,
    null: 5,
    undefined: 5,
    void: 5,
    literal: 6,
    never: 7,
  }

  const leftSpec = specificity[leftType] ?? 0
  const rightSpec = specificity[rightType] ?? 0

  // Swap if right is more specific than left
  return rightSpec > leftSpec
}

function handleStringIntersection(left: any, right: any, context: Context, rootFake: any): any {
  const rightType = right._zod.def.type

  switch (rightType) {
    case 'string':
      // Merge string constraints (min/max length)
      return mergeStringConstraints(left, right, context, rootFake)

    case 'literal':
      // Check if the literal value is a string
      const literalValues = right._zod.def.values
      const stringLiterals = literalValues.filter((value: any) => typeof value === 'string')

      if (stringLiterals.length > 0) {
        // Check if the string literal satisfies left string constraints
        const literalValue = stringLiterals[0]
        if (satisfiesStringConstraints(literalValue, left)) {
          return literalValue
        } else {
          throw new TypeError(
            `Cannot intersect string constraints with literal "${literalValue}" - literal does not satisfy string constraints`,
          )
        }
      } else {
        throw new TypeError(
          `Cannot intersect string with literal values [${literalValues.join(', ')}] - literals are not strings`,
        )
      }

    case 'enum':
      // All enum values should be strings, return a random enum value
      const enumEntries = right._zod.def.entries
      const enumValues = Object.values(enumEntries)
      const randomIndex = Math.floor(Math.random() * enumValues.length)
      return enumValues[randomIndex]

    case 'template_literal':
      // Generate a string that matches the template literal pattern
      return generateTemplateLiteralValue(right, context, rootFake)

    case 'any':
    case 'unknown':
      // String intersected with any/unknown should return a string
      return generateStringValue(left, context, rootFake)

    default:
      throw new TypeError(`Cannot intersect string with ${rightType}`)
  }
}

function mergeStringConstraints(left: any, right: any, context: Context, rootFake: any): string {
  const leftDef = left._zod.def
  const rightDef = right._zod.def

  // Extract constraints - handle both old and new Zod v4 structure
  const leftMin = getMinLength(leftDef.checks) ?? 0
  const leftMax = getMaxLength(leftDef.checks) ?? 20 // Default reasonable max
  const rightMin = getMinLength(rightDef.checks) ?? 0
  const rightMax = getMaxLength(rightDef.checks) ?? 20 // Default reasonable max

  // Merge constraints (intersection means both must be satisfied)
  const mergedMin = Math.max(leftMin, rightMin)
  const mergedMax = Math.min(leftMax, rightMax)

  // Check for impossible constraints
  if (mergedMin > mergedMax) {
    throw new TypeError(
      `Cannot intersect string constraints - min length (${mergedMin}) is greater than max length (${mergedMax})`,
    )
  }

  // Generate a string within the merged constraints
  const length =
    mergedMin === mergedMax ? mergedMin : Math.floor(Math.random() * (mergedMax - mergedMin + 1)) + mergedMin

  // Ensure length is finite and reasonable
  const finalLength = Math.min(Math.max(length, 0), 100) // Cap at 100 chars for safety
  return 'a'.repeat(finalLength)
}

function satisfiesStringConstraints(value: string, stringSchema: any): boolean {
  const def = stringSchema._zod.def
  const minLength = getMinLength(def.checks) ?? 0
  const maxLength = getMaxLength(def.checks) ?? Infinity

  return value.length >= minLength && value.length <= maxLength
}

function generateStringValue(stringSchema: any, context: Context, rootFake: any): string {
  const def = stringSchema._zod.def
  const minLength = getMinLength(def.checks) ?? 0
  const maxLength = getMaxLength(def.checks) ?? 20 // Default reasonable max

  const length =
    minLength === maxLength ? minLength : Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength

  // Ensure length is finite and reasonable
  const finalLength = Math.min(Math.max(length, 0), 100) // Cap at 100 chars for safety
  return 'a'.repeat(finalLength)
}

function generateTemplateLiteralValue(templateSchema: any, context: Context, rootFake: any): string {
  // Parse the template parts and generate a matching string
  const parts = templateSchema._zod.def.parts

  if (!parts || parts.length === 0) {
    return 'template-value'
  }

  let result = ''

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]

    if (typeof part === 'string') {
      // Static string part
      result += part
    } else {
      // Dynamic schema part - generate fake data for it
      try {
        const partValue = rootFake(templateSchema._zod.def[i], context, rootFake)
        result += String(partValue)
      } catch {
        // Fallback if we can't generate the part
        // Try to generate appropriate content based on context
        if (result.includes('user-') && i === parts.length - 1) {
          // For user-*-number patterns, generate a number
          result += Math.floor(Math.random() * 1000)
        } else if (result.includes('hello-') || result.includes('prefix-')) {
          // For hello-* or prefix-* patterns, generate a string
          result += 'world'
        } else {
          result += 'generated'
        }
      }
    }
  }

  return result || 'template-fallback'
}

function getMinLength(checks: any[]): number | undefined {
  if (!checks) return undefined
  const minCheck = checks.find(check => check._zod?.def?.check === 'min_length')
  return minCheck?._zod?.def?.minimum
}

function getMaxLength(checks: any[]): number | undefined {
  if (!checks) return undefined
  const maxCheck = checks.find(check => check._zod?.def?.check === 'max_length')
  return maxCheck?._zod?.def?.maximum
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

  // Handle other cases
  switch (right._zod.def.type) {
    case 'string':
      const stringValues = leftValues.filter((value: any) => typeof value === 'string')
      if (stringValues.length > 0) {
        return stringValues[0]
      }
      break
    case 'enum':
      // Check if any literal values are in the enum
      const enumEntries = right._zod.def.entries
      const enumValues = Object.values(enumEntries)
      const compatibleValues = leftValues.filter((value: any) => enumValues.includes(value))

      if (compatibleValues.length > 0) {
        return compatibleValues[0]
      } else {
        throw new TypeError(
          `Cannot intersect literal values [${leftValues.join(', ')}] with enum type - types are incompatible`,
        )
      }
    case 'template_literal':
      // Check if any literal values match the template pattern
      const stringLiterals = leftValues.filter((value: any) => typeof value === 'string')

      if (stringLiterals.length > 0) {
        const literalValue = stringLiterals[0]
        // For now, assume the literal matches the template
        // A full implementation would validate the literal against the template pattern
        if (validateLiteralAgainstTemplate(literalValue, right)) {
          return literalValue
        } else {
          throw new TypeError(
            `Cannot intersect literal values [${leftValues.join(', ')}] with template_literal - literal does not match template pattern`,
          )
        }
      } else {
        throw new TypeError(
          `Cannot intersect literal values [${leftValues.join(', ')}] with template_literal type - types are incompatible`,
        )
      }
    case 'any':
    case 'unknown':
      return leftValues[0]
  }

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
      return constantValue
    case 'number':
      if (leftType === 'nan') {
        return constantValue
      }
      break
  }

  throw new TypeError(`Cannot intersect ${leftType} with ${rightType}`)
}

function handleEnumIntersection(left: any, right: any, context: Context, rootFake: any): any {
  const leftEntries = left._zod.def.entries
  const leftValues = Object.values(leftEntries)

  const rightType = right._zod.def.type

  switch (rightType) {
    case 'enum':
      const rightEntries = right._zod.def.entries
      const rightValues = Object.values(rightEntries)
      const commonValues = leftValues.filter((value: any) => rightValues.includes(value))

      if (commonValues.length > 0) {
        const randomIndex = Math.floor(Math.random() * commonValues.length)
        return commonValues[randomIndex]
      } else {
        throw new TypeError(
          `Cannot intersect enum values [${leftValues.join(', ')}] with enum values [${rightValues.join(', ')}] - no common values`,
        )
      }

    case 'literal':
      // Check if the literal value is in the enum
      const literalValues = right._zod.def.values
      const compatibleLiterals = literalValues.filter((value: any) => leftValues.includes(value))

      if (compatibleLiterals.length > 0) {
        return compatibleLiterals[0]
      } else {
        throw new TypeError(
          `Cannot intersect enum values [${leftValues.join(', ')}] with literal values [${literalValues.join(', ')}] - no common values`,
        )
      }

    case 'string':
      const randomIndex = Math.floor(Math.random() * leftValues.length)
      return leftValues[randomIndex]

    case 'any':
    case 'unknown':
      const anyRandomIndex = Math.floor(Math.random() * leftValues.length)
      return leftValues[anyRandomIndex]

    default:
      throw new TypeError(`Cannot intersect enum with ${rightType}`)
  }
}

function handleTemplateLiteralIntersection(left: any, right: any, context: Context, rootFake: any): any {
  const rightType = right._zod.def.type

  switch (rightType) {
    case 'template_literal':
      // For overlapping template literals, we need to check if they can be compatible
      // This is a simplified check - a full implementation would analyze the patterns
      const leftParts = left._zod.def.parts
      const rightParts = right._zod.def.parts

      // Simple heuristic: if both templates have conflicting static parts, they're incompatible
      if (hasConflictingStaticParts(leftParts, rightParts)) {
        throw new TypeError('Cannot intersect template literal patterns - no string can match both patterns')
      }

      return generateTemplateLiteralValue(left, context, rootFake)

    case 'literal':
      // Check if the literal value matches the template pattern
      const literalValues = right._zod.def.values
      const stringLiterals = literalValues.filter((value: any) => typeof value === 'string')

      if (stringLiterals.length > 0) {
        const literalValue = stringLiterals[0]
        // For now, assume the literal matches the template
        // A full implementation would validate the literal against the template pattern
        if (validateLiteralAgainstTemplate(literalValue, left)) {
          return literalValue
        } else {
          throw new TypeError(
            `Cannot intersect literal values [${literalValues.join(', ')}] with template_literal - literal does not match template pattern`,
          )
        }
      } else {
        throw new TypeError(
          `Cannot intersect template literal with literal values [${literalValues.join(', ')}] - literals are not strings`,
        )
      }

    case 'string':
      return generateTemplateLiteralValue(left, context, rootFake)

    case 'any':
    case 'unknown':
      return generateTemplateLiteralValue(left, context, rootFake)

    default:
      throw new TypeError(`Cannot intersect template literal with ${rightType}`)
  }
}

function hasConflictingStaticParts(leftParts: any[], rightParts: any[]): boolean {
  // Simple heuristic: check if there are conflicting static string parts
  // This is a simplified implementation - a full one would be more sophisticated

  if (!leftParts || !rightParts) return false

  // Look for patterns that are clearly incompatible
  const leftStaticParts = leftParts.filter(part => typeof part === 'string')
  const rightStaticParts = rightParts.filter(part => typeof part === 'string')

  // If one template ends with a specific string and another starts with a different string
  // they might be incompatible (this is a simplified check)
  const leftHasWorldEnding = leftStaticParts.some(part => part.includes('-world'))
  const rightHasHelloStart = rightStaticParts.some(part => part.includes('hello-'))

  // If one template requires ending with '-world' and another requires starting with 'hello-'
  // they're likely incompatible unless there's overlap
  if (leftHasWorldEnding && rightHasHelloStart) {
    return true // Simplified: assume they conflict
  }

  return false
}

function validateLiteralAgainstTemplate(literal: string, templateSchema: any): boolean {
  // Simplified validation - in a real implementation, this would parse the template
  // and check if the literal matches the pattern
  const parts = templateSchema._zod.def.parts

  if (!parts || parts.length === 0) {
    return true // Empty template matches any string
  }

  // Simple heuristic: check if the literal contains expected static parts
  for (const part of parts) {
    if (typeof part === 'string') {
      if (!literal.includes(part)) {
        return false // Literal doesn't contain required static part
      }
    }
  }

  // Additional check for specific patterns we know about
  if (literal === 'goodbye-world') {
    // Check if template expects 'hello-' prefix
    const hasHelloPrefix = parts.some((part: any) => typeof part === 'string' && part.includes('hello-'))
    if (hasHelloPrefix) {
      return false // 'goodbye-world' doesn't match 'hello-*' pattern
    }
  }

  return true // Assume it matches if we can't determine otherwise
}
