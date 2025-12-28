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

function handleStringIntersection(left: any, right: any, context: Context, rootFake: any): any {
  const rightType = right._zod.def.type

  switch (rightType) {
    case 'string':
      // Simple case: string & string = string
      return 'intersected-string'

    case 'literal':
      // Check if the literal value is a string
      const literalValues = right._zod.def.values
      const stringLiterals = literalValues.filter((value: any) => typeof value === 'string')

      if (stringLiterals.length > 0) {
        return stringLiterals[0]
      } else {
        throw new TypeError(
          `Cannot intersect string with literal values [${literalValues.join(', ')}] - literals are not strings`,
        )
      }

    default:
      throw new TypeError(`Cannot intersect string with ${rightType}`)
  }
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
      return 'template-literal-value'

    case 'string':
      return 'template-string-value'

    case 'any':
    case 'unknown':
      return 'template-any-value'

    default:
      throw new TypeError(`Cannot intersect template literal with ${rightType}`)
  }
}