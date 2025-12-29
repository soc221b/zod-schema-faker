import { faker } from '@faker-js/faker'
import { beforeAll, describe, expect, it } from 'vitest'
import * as z from 'zod/v4'
import { fake, setFaker } from '../../src/v4'

describe('v4 intersection faker', () => {
  beforeAll(() => {
    setFaker(faker)
  })
  describe('Property 1: Intersection data validity', () => {
    it('**Feature: v4-intersection, Property 1: Intersection data validity**', () => {
      // **Validates: Requirements 1.1, 1.2**

      // Test basic intersection infrastructure with simple cases
      // For now, we expect these to throw "not yet implemented" errors
      // since we haven't implemented the handlers yet

      const stringSchema = z.string()
      const numberSchema = z.number()

      // This should throw an error since string & number is impossible
      expect(() => {
        const intersectionSchema = z.intersection(stringSchema, numberSchema)
        fake(intersectionSchema)
      }).toThrow('Cannot intersect string with number')

      // Test that the intersection case is being reached
      const literalA = z.literal('a')
      const literalB = z.literal('b')

      expect(() => {
        const intersectionSchema = z.intersection(literalA, literalB)
        fake(intersectionSchema)
      }).toThrow('Cannot intersect literal values')

      // Test that the infrastructure correctly identifies schema types
      const objectSchema = z.object({ name: z.string() })
      const anotherObjectSchema = z.object({ age: z.number() })

      // Object intersections are now supported, so this should not throw
      const intersectionSchema = z.intersection(objectSchema, anotherObjectSchema)
      const result = fake(intersectionSchema)
      expect(typeof result).toBe('object')
      expect(result).not.toBeNull()
    })
  })

  describe('constant type intersection handlers', () => {
    it('should handle nan intersections', () => {
      // nan & nan should return NaN
      const nanSchema1 = z.nan()
      const nanSchema2 = z.nan()
      const intersection = z.intersection(nanSchema1, nanSchema2)

      const result = fake(intersection)
      expect(Number.isNaN(result)).toBe(true)

      // nan & number should check if NaN satisfies number constraints
      const numberSchema = z.number()
      const nanNumberIntersection = z.intersection(nanSchema1, numberSchema)
      const nanNumberResult = fake(nanNumberIntersection)
      expect(Number.isNaN(nanNumberResult)).toBe(true)

      // nan & string should be impossible
      const stringSchema = z.string()
      const nanStringIntersection = z.intersection(nanSchema1, stringSchema)
      expect(() => fake(nanStringIntersection)).toThrow('Cannot intersect nan with string')
    })

    it('should handle null intersections', () => {
      // null & null should return null
      const nullSchema1 = z.null()
      const nullSchema2 = z.null()
      const intersection = z.intersection(nullSchema1, nullSchema2)

      const result = fake(intersection)
      expect(result).toBe(null)

      // null & string should be impossible
      const stringSchema = z.string()
      const nullStringIntersection = z.intersection(nullSchema1, stringSchema)
      expect(() => fake(nullStringIntersection)).toThrow('Cannot intersect null with string')
    })

    it('should handle undefined intersections', () => {
      // undefined & undefined should return undefined
      const undefinedSchema1 = z.undefined()
      const undefinedSchema2 = z.undefined()
      const intersection = z.intersection(undefinedSchema1, undefinedSchema2)

      const result = fake(intersection)
      expect(result).toBe(undefined)

      // undefined & string should be impossible
      const stringSchema = z.string()
      const undefinedStringIntersection = z.intersection(undefinedSchema1, stringSchema)
      expect(() => fake(undefinedStringIntersection)).toThrow('Cannot intersect undefined with string')
    })

    it('should handle void intersections', () => {
      // void & void should return undefined (void returns undefined)
      const voidSchema1 = z.void()
      const voidSchema2 = z.void()
      const intersection = z.intersection(voidSchema1, voidSchema2)

      const result = fake(intersection)
      expect(result).toBe(undefined)

      // void & string should be impossible
      const stringSchema = z.string()
      const voidStringIntersection = z.intersection(voidSchema1, stringSchema)
      expect(() => fake(voidStringIntersection)).toThrow('Cannot intersect void with string')
    })
  })

  describe('literal intersection handler', () => {
    it('should handle identical literals by returning the literal value', () => {
      // Same literal values should intersect to that value
      const literalA1 = z.literal('hello')
      const literalA2 = z.literal('hello')

      const intersectionSchema = z.intersection(literalA1, literalA2)
      const result = fake(intersectionSchema)

      expect(result).toBe('hello')
    })

    it('should throw error for conflicting literals', () => {
      // Different literal values cannot be intersected
      const literalA = z.literal('hello')
      const literalB = z.literal('world')

      const intersectionSchema = z.intersection(literalA, literalB)

      expect(() => fake(intersectionSchema)).toThrow('Cannot intersect literal')
    })

    it('should handle literal with compatible type', () => {
      // Literal should work with compatible base type
      const literalString = z.literal('hello')
      const stringSchema = z.string()

      const intersectionSchema = z.intersection(literalString, stringSchema)
      const result = fake(intersectionSchema)

      // Should return the literal value since it satisfies both constraints
      expect(result).toBe('hello')
    })

    it('should handle literal with incompatible type', () => {
      // Literal string with number should be impossible
      const literalString = z.literal('hello')
      const numberSchema = z.number()

      const intersectionSchema = z.intersection(literalString, numberSchema)

      expect(() => fake(intersectionSchema)).toThrow('Cannot intersect literal')
    })

    it('should handle different literal types', () => {
      // Test with number literals
      const literalNum1 = z.literal(42)
      const literalNum2 = z.literal(42)
      const literalNum3 = z.literal(24)

      // Same number literals should work
      const sameIntersection = z.intersection(literalNum1, literalNum2)
      expect(fake(sameIntersection)).toBe(42)

      // Different number literals should fail
      const differentIntersection = z.intersection(literalNum1, literalNum3)
      expect(() => fake(differentIntersection)).toThrow('Cannot intersect literal')
    })
  })

  describe('never intersection handler', () => {
    it('should always result in never when left schema is never', () => {
      // Never intersected with anything should always result in never
      const neverSchema = z.never()
      const stringSchema = z.string()
      const numberSchema = z.number()
      const objectSchema = z.object({ name: z.string() })

      const testCases = [
        { right: stringSchema, description: 'never & string' },
        { right: numberSchema, description: 'never & number' },
        { right: objectSchema, description: 'never & object' },
        { right: neverSchema, description: 'never & never' },
      ]

      testCases.forEach(({ right, description }) => {
        const intersectionSchema = z.intersection(neverSchema, right)

        // Since never represents an impossible type, any intersection with never
        // should throw an error indicating the intersection is impossible
        expect(() => fake(intersectionSchema)).toThrow()

        // The error should be from our never handler, not "not yet implemented"
        expect(() => fake(intersectionSchema)).not.toThrow('handleNeverIntersection not yet implemented')
      })
    })

    it('should handle never on the right side through swapping', () => {
      // When never is on the right side, it should be swapped to the left
      // and handled by the never handler
      const stringSchema = z.string()
      const neverSchema = z.never()

      const intersectionSchema = z.intersection(stringSchema, neverSchema)

      // This should also result in an impossible intersection
      expect(() => fake(intersectionSchema)).toThrow()

      // The error should be from the never handler, not the string handler
      expect(() => fake(intersectionSchema)).toThrow(
        'Cannot generate fake data for intersection with never type - intersection is impossible',
      )
    })
  })

  describe('enum intersection handler', () => {
    it('should handle identical enums by returning a valid enum value', () => {
      // Same enum should intersect to a value from that enum
      const colorEnum = z.enum(['red', 'green', 'blue'])
      const sameColorEnum = z.enum(['red', 'green', 'blue'])

      const intersectionSchema = z.intersection(colorEnum, sameColorEnum)
      const result = fake(intersectionSchema)

      // Should return one of the enum values
      expect(['red', 'green', 'blue']).toContain(result)
    })

    it('should handle overlapping enums by returning a common value', () => {
      // Enums with some common values should intersect to a common value
      const primaryColors = z.enum(['red', 'green', 'blue'])
      const warmColors = z.enum(['red', 'orange', 'yellow'])

      const intersectionSchema = z.intersection(primaryColors, warmColors)
      const result = fake(intersectionSchema)

      // Should return 'red' since it's the only common value
      expect(result).toBe('red')
    })

    it('should throw error for non-overlapping enums', () => {
      // Enums with no common values cannot be intersected
      const primaryColors = z.enum(['red', 'green', 'blue'])
      const metals = z.enum(['gold', 'silver', 'bronze'])

      const intersectionSchema = z.intersection(primaryColors, metals)

      expect(() => fake(intersectionSchema)).toThrow('Cannot intersect enum')
    })

    it('should handle enum with compatible literal', () => {
      // Enum should work with literal if literal value is in enum
      const colorEnum = z.enum(['red', 'green', 'blue'])
      const redLiteral = z.literal('red')

      const intersectionSchema = z.intersection(colorEnum, redLiteral)
      const result = fake(intersectionSchema)

      // Should return the literal value since it's in the enum
      expect(result).toBe('red')
    })

    it('should throw error for enum with incompatible literal', () => {
      // Enum with literal not in enum should be impossible
      const colorEnum = z.enum(['red', 'green', 'blue'])
      const yellowLiteral = z.literal('yellow')

      const intersectionSchema = z.intersection(colorEnum, yellowLiteral)

      expect(() => fake(intersectionSchema)).toThrow(
        'Cannot intersect literal values [yellow] with enum type - types are incompatible',
      )
    })

    it('should handle enum with compatible string type', () => {
      // Enum should work with string type (enum values are strings)
      const colorEnum = z.enum(['red', 'green', 'blue'])
      const stringSchema = z.string()

      const intersectionSchema = z.intersection(colorEnum, stringSchema)
      const result = fake(intersectionSchema)

      // Should return one of the enum values (which are all strings)
      expect(['red', 'green', 'blue']).toContain(result)
      expect(typeof result).toBe('string')
    })

    it('should throw error for enum with incompatible type', () => {
      // Enum with number should be impossible (enum values are strings)
      const colorEnum = z.enum(['red', 'green', 'blue'])
      const numberSchema = z.number()

      const intersectionSchema = z.intersection(colorEnum, numberSchema)

      expect(() => fake(intersectionSchema)).toThrow('Cannot intersect enum')
    })

    it('should handle numeric enums', () => {
      // Test with numeric enum values
      const statusEnum = z.enum(['1', '2', '3']) // Note: Zod enums are always string-based
      const sameStatusEnum = z.enum(['1', '2', '3'])

      const intersectionSchema = z.intersection(statusEnum, sameStatusEnum)
      const result = fake(intersectionSchema)

      expect(['1', '2', '3']).toContain(result)
    })
  })

  describe('template literal intersection handler', () => {
    it('should handle identical template literals by returning a matching value', () => {
      // Same template literal should intersect to a value matching that pattern
      const template1 = z.templateLiteral(['hello-', z.string()] as any)
      const template2 = z.templateLiteral(['hello-', z.string()] as any)

      const intersectionSchema = z.intersection(template1, template2)
      const result = fake(intersectionSchema)

      // Should return a string matching the template pattern
      expect(typeof result).toBe('string')
      expect(result).toMatch(/^hello-.+/)
    })

    it('should handle overlapping template literals by finding common pattern', () => {
      // Template literals with overlapping patterns should work
      const template1 = z.templateLiteral([z.string(), '-world'] as any)
      const template2 = z.templateLiteral(['hello-', z.string()] as any)

      const intersectionSchema = z.intersection(template1, template2)

      // This should be impossible since no string can match both patterns
      expect(() => fake(intersectionSchema)).toThrow('Cannot intersect template literal')
    })

    it('should handle template literal with compatible literal', () => {
      // Template literal should work with literal if literal matches pattern
      const template = z.templateLiteral(['hello-', z.string()] as any)
      const literal = z.literal('hello-world')

      const intersectionSchema = z.intersection(template, literal)
      const result = fake(intersectionSchema)

      // Should return the literal value since it matches the template
      expect(result).toBe('hello-world')
    })

    it('should throw error for template literal with incompatible literal', () => {
      // Template literal with non-matching literal should be impossible
      const template = z.templateLiteral(['hello-', z.string()] as any)
      const literal = z.literal('goodbye-world')

      const intersectionSchema = z.intersection(template, literal)

      expect(() => fake(intersectionSchema)).toThrow(
        'Cannot intersect literal values [goodbye-world] with template_literal - literal does not match template pattern',
      )
    })

    it('should handle template literal with compatible string type', () => {
      // Template literal should work with string type (template generates strings)
      const template = z.templateLiteral(['prefix-', z.string(), '-suffix'] as any)
      const stringSchema = z.string()

      const intersectionSchema = z.intersection(template, stringSchema)
      const result = fake(intersectionSchema)

      // Should return a string matching the template pattern
      expect(typeof result).toBe('string')
      expect(result).toMatch(/^prefix-.+-suffix$/)
    })

    it('should throw error for template literal with incompatible type', () => {
      // Template literal with number should be impossible (templates generate strings)
      const template = z.templateLiteral(['hello-', z.string()] as any)
      const numberSchema = z.number()

      const intersectionSchema = z.intersection(template, numberSchema)

      expect(() => fake(intersectionSchema)).toThrow('Cannot intersect template literal')
    })

    it('should handle complex template literals', () => {
      // Test with more complex template patterns
      const template = z.templateLiteral(['user-', z.string(), '-', z.number()] as any)
      const stringSchema = z.string()

      const intersectionSchema = z.intersection(template, stringSchema)
      const result = fake(intersectionSchema)

      // Should return a string matching the complex template pattern
      expect(typeof result).toBe('string')
      expect(result).toMatch(/^user-.+-\d+$/)
    })
  })

  describe('string intersection handler', () => {
    it('should handle identical string schemas by returning a valid string', () => {
      // Same string schema should intersect to a valid string
      const stringSchema1 = z.string()
      const stringSchema2 = z.string()

      const intersectionSchema = z.intersection(stringSchema1, stringSchema2)
      const result = fake(intersectionSchema)

      expect(typeof result).toBe('string')
    })

    it('should handle string length constraints by merging them', () => {
      // String with min/max constraints should merge constraints
      const minString = z.string().min(5)
      const maxString = z.string().max(10)

      const intersectionSchema = z.intersection(minString, maxString)
      const result = fake(intersectionSchema)

      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThanOrEqual(5)
      expect(result.length).toBeLessThanOrEqual(10)
    })

    it('should throw error for conflicting length constraints', () => {
      // Conflicting constraints should be impossible
      const minString = z.string().min(10)
      const maxString = z.string().max(5)

      const intersectionSchema = z.intersection(minString, maxString)

      expect(() => fake(intersectionSchema)).toThrow(
        'Cannot intersect string constraints - min length (10) is greater than max length (5)',
      )
    })

    it('should handle string with compatible literal', () => {
      // String should work with string literal
      const stringSchema = z.string()
      const stringLiteral = z.literal('hello')

      const intersectionSchema = z.intersection(stringSchema, stringLiteral)
      const result = fake(intersectionSchema)

      expect(result).toBe('hello')
    })

    it('should handle string with compatible enum', () => {
      // String should work with string enum
      const stringSchema = z.string()
      const colorEnum = z.enum(['red', 'green', 'blue'])

      const intersectionSchema = z.intersection(stringSchema, colorEnum)
      const result = fake(intersectionSchema)

      expect(['red', 'green', 'blue']).toContain(result)
    })

    it('should handle string with compatible template literal', () => {
      // String should work with template literal
      const stringSchema = z.string()
      const template = z.templateLiteral(['hello-', z.string()] as any)

      const intersectionSchema = z.intersection(stringSchema, template)
      const result = fake(intersectionSchema)

      expect(typeof result).toBe('string')
      expect(result).toMatch(/^hello-.+/)
    })

    it('should throw error for string with incompatible type', () => {
      // String with number should be impossible
      const stringSchema = z.string()
      const numberSchema = z.number()

      const intersectionSchema = z.intersection(stringSchema, numberSchema)

      expect(() => fake(intersectionSchema)).toThrow('Cannot intersect string with number')
    })

    it('should handle string with any/unknown types', () => {
      // String should work with any/unknown
      const stringSchema = z.string()
      const anySchema = z.any()
      const unknownSchema = z.unknown()

      const stringAnyIntersection = z.intersection(stringSchema, anySchema)
      const stringUnknownIntersection = z.intersection(stringSchema, unknownSchema)

      const anyResult = fake(stringAnyIntersection)
      const unknownResult = fake(stringUnknownIntersection)

      expect(typeof anyResult).toBe('string')
      expect(typeof unknownResult).toBe('string')
    })

    it('should handle complex string constraints', () => {
      // Test multiple constraints together
      const constrainedString = z.string().min(3).max(8)
      const anotherConstrainedString = z.string().min(5).max(10)

      const intersectionSchema = z.intersection(constrainedString, anotherConstrainedString)
      const result = fake(intersectionSchema)

      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThanOrEqual(5) // max of mins
      expect(result.length).toBeLessThanOrEqual(8) // min of maxes
    })
  })

  describe('number intersection handler', () => {
    it('should handle identical number schemas by returning a valid number', () => {
      // Same number schema should intersect to a valid number
      const numberSchema1 = z.number()
      const numberSchema2 = z.number()

      const intersectionSchema = z.intersection(numberSchema1, numberSchema2)
      const result = fake(intersectionSchema)

      expect(typeof result).toBe('number')
    })

    it('should handle number range constraints by merging them', () => {
      // Number with min/max constraints should merge constraints
      const minNumber = z.number().min(5)
      const maxNumber = z.number().max(10)

      const intersectionSchema = z.intersection(minNumber, maxNumber)
      const result = fake(intersectionSchema)

      expect(typeof result).toBe('number')
      expect(result).toBeGreaterThanOrEqual(5)
      expect(result).toBeLessThanOrEqual(10)
    })

    it('should throw error for conflicting range constraints', () => {
      // Conflicting constraints should be impossible
      const minNumber = z.number().min(10)
      const maxNumber = z.number().max(5)

      const intersectionSchema = z.intersection(minNumber, maxNumber)

      expect(() => fake(intersectionSchema)).toThrow(
        'Cannot intersect number constraints - min value (10) is greater than max value (5)',
      )
    })

    it('should handle number with compatible literal', () => {
      // Number should work with number literal
      const numberSchema = z.number()
      const numberLiteral = z.literal(42)

      const intersectionSchema = z.intersection(numberSchema, numberLiteral)
      const result = fake(intersectionSchema)

      expect(result).toBe(42)
    })

    it('should handle integer constraints', () => {
      // Number with integer constraint should generate integers
      const integerNumber = z.number().int()
      const rangeNumber = z.number().min(1).max(10)

      const intersectionSchema = z.intersection(integerNumber, rangeNumber)
      const result = fake(intersectionSchema)

      expect(typeof result).toBe('number')
      expect(Number.isInteger(result)).toBe(true)
      expect(result).toBeGreaterThanOrEqual(1)
      expect(result).toBeLessThanOrEqual(10)
    })

    it('should handle step constraints', () => {
      // Number with step constraint should generate multiples
      const stepNumber = z.number().step(0.5)
      const rangeNumber = z.number().min(0).max(5)

      const intersectionSchema = z.intersection(stepNumber, rangeNumber)
      const result = fake(intersectionSchema)

      expect(typeof result).toBe('number')
      expect(result % 0.5).toBe(0)
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(5)
    })

    it('should throw error for number with incompatible type', () => {
      // Number with string should be impossible
      const numberSchema = z.number()
      const stringSchema = z.string()

      const intersectionSchema = z.intersection(numberSchema, stringSchema)

      expect(() => fake(intersectionSchema)).toThrow('Cannot intersect number with string')
    })

    it('should handle number with any/unknown types', () => {
      // Number should work with any/unknown
      const numberSchema = z.number()
      const anySchema = z.any()
      const unknownSchema = z.unknown()

      const numberAnyIntersection = z.intersection(numberSchema, anySchema)
      const numberUnknownIntersection = z.intersection(numberSchema, unknownSchema)

      const anyResult = fake(numberAnyIntersection)
      const unknownResult = fake(numberUnknownIntersection)

      expect(typeof anyResult).toBe('number')
      expect(typeof unknownResult).toBe('number')
    })

    it('should handle complex number constraints', () => {
      // Test multiple constraints together
      const constrainedNumber = z.number().min(1).max(100).int()
      const anotherConstrainedNumber = z.number().min(50).max(200)

      const intersectionSchema = z.intersection(constrainedNumber, anotherConstrainedNumber)
      const result = fake(intersectionSchema)

      expect(typeof result).toBe('number')
      expect(Number.isInteger(result)).toBe(true)
      expect(result).toBeGreaterThanOrEqual(50) // max of mins
      expect(result).toBeLessThanOrEqual(100) // min of maxes
    })
  })

  describe('basic infrastructure tests', () => {
    it('should reach intersection handler for different schema types', () => {
      // Test that different schema types reach their respective handlers
      const testCases = [
        {
          left: z.never(),
          right: z.string(),
          expectedError: 'Cannot generate fake data for intersection with never type - intersection is impossible',
        },
        { left: z.literal('test'), right: z.string(), expectedResult: 'test' }, // Should return the literal value
        { left: z.nan(), right: z.number(), expectedResult: NaN }, // NaN intersects with number
        { left: z.null(), right: z.string(), expectedError: 'Cannot intersect null with string' },
        { left: z.undefined(), right: z.string(), expectedError: 'Cannot intersect undefined with string' },
        { left: z.void(), right: z.string(), expectedError: 'Cannot intersect void with string' },
      ]

      testCases.forEach(({ left, right, expectedError, expectedResult }) => {
        if (expectedResult !== undefined) {
          // This case should succeed and return the expected result
          const intersectionSchema = z.intersection(left, right)
          const result = fake(intersectionSchema)
          if (Number.isNaN(expectedResult)) {
            expect(Number.isNaN(result)).toBe(true)
          } else {
            expect(result).toBe(expectedResult)
          }
        } else {
          expect(() => {
            const intersectionSchema = z.intersection(left, right)
            fake(intersectionSchema)
          }).toThrow(expectedError)
        }
      })
    })

    it('should handle future v4 types with descriptive errors', () => {
      // These types are marked as TODO in v4, so we should get appropriate errors
      // Note: We can't actually test int, success, transform since they're not implemented in Zod v4 yet
      // This test is a placeholder for when those types become available

      // For now, just verify our infrastructure is set up correctly
      expect(() => {
        const stringSchema = z.string()
        const numberSchema = z.number()
        const intersectionSchema = z.intersection(stringSchema, numberSchema)
        fake(intersectionSchema)
      }).toThrow('Cannot intersect string with number')
    })
  })

  describe('bigint intersection handler', () => {
    it('should handle identical bigint schemas by returning a valid bigint', () => {
      // Same bigint schema should intersect to a valid bigint
      const bigintSchema1 = z.bigint()
      const bigintSchema2 = z.bigint()

      const intersectionSchema = z.intersection(bigintSchema1, bigintSchema2)
      const result = fake(intersectionSchema)

      expect(typeof result).toBe('bigint')
    })

    it('should handle bigint range constraints by merging them', () => {
      // Bigint with min/max constraints should merge constraints
      const minBigint = z.bigint().min(5n)
      const maxBigint = z.bigint().max(10n)

      const intersectionSchema = z.intersection(minBigint, maxBigint)
      const result = fake(intersectionSchema)

      expect(typeof result).toBe('bigint')
      expect(result).toBeGreaterThanOrEqual(5n)
      expect(result).toBeLessThanOrEqual(10n)
    })

    it('should throw error for conflicting range constraints', () => {
      // Conflicting constraints should be impossible
      const minBigint = z.bigint().min(10n)
      const maxBigint = z.bigint().max(5n)

      const intersectionSchema = z.intersection(minBigint, maxBigint)

      expect(() => fake(intersectionSchema)).toThrow(
        'Cannot intersect bigint constraints - min value (10) is greater than max value (5)',
      )
    })

    it('should handle bigint with compatible literal', () => {
      // Bigint should work with bigint literal
      const bigintSchema = z.bigint()
      const bigintLiteral = z.literal(42n)

      const intersectionSchema = z.intersection(bigintSchema, bigintLiteral)
      const result = fake(intersectionSchema)

      expect(result).toBe(42n)
    })

    it('should throw error for bigint with incompatible type', () => {
      // Bigint with string should be impossible
      const bigintSchema = z.bigint()
      const stringSchema = z.string()

      const intersectionSchema = z.intersection(bigintSchema, stringSchema)

      // Since string and bigint have same specificity, no swapping occurs
      // The error comes from the bigint handler
      expect(() => fake(intersectionSchema)).toThrow('Cannot intersect bigint with string')
    })

    it('should handle bigint with any/unknown types', () => {
      // Bigint should work with any/unknown
      const bigintSchema = z.bigint()
      const anySchema = z.any()
      const unknownSchema = z.unknown()

      const bigintAnyIntersection = z.intersection(bigintSchema, anySchema)
      const bigintUnknownIntersection = z.intersection(bigintSchema, unknownSchema)

      const anyResult = fake(bigintAnyIntersection)
      const unknownResult = fake(bigintUnknownIntersection)

      expect(typeof anyResult).toBe('bigint')
      expect(typeof unknownResult).toBe('bigint')
    })

    it('should handle complex bigint constraints', () => {
      // Test multiple constraints together
      const constrainedBigint = z.bigint().min(1n).max(100n)
      const anotherConstrainedBigint = z.bigint().min(50n).max(200n)

      const intersectionSchema = z.intersection(constrainedBigint, anotherConstrainedBigint)
      const result = fake(intersectionSchema)

      expect(typeof result).toBe('bigint')
      expect(result).toBeGreaterThanOrEqual(50n) // max of mins
      expect(result).toBeLessThanOrEqual(100n) // min of maxes
    })
  })

  describe('boolean intersection handler', () => {
    it('should handle identical boolean schemas by returning a valid boolean', () => {
      // Same boolean schema should intersect to a valid boolean
      const booleanSchema1 = z.boolean()
      const booleanSchema2 = z.boolean()

      const intersectionSchema = z.intersection(booleanSchema1, booleanSchema2)
      const result = fake(intersectionSchema)

      expect(typeof result).toBe('boolean')
    })

    it('should handle boolean with compatible literal', () => {
      // Boolean should work with boolean literal
      const booleanSchema = z.boolean()
      const trueLiteral = z.literal(true)
      const falseLiteral = z.literal(false)

      const trueIntersection = z.intersection(booleanSchema, trueLiteral)
      const falseIntersection = z.intersection(booleanSchema, falseLiteral)

      const trueResult = fake(trueIntersection)
      const falseResult = fake(falseIntersection)

      expect(trueResult).toBe(true)
      expect(falseResult).toBe(false)
    })

    it('should throw error for boolean with incompatible literal', () => {
      // Boolean with non-boolean literal should be impossible
      const booleanSchema = z.boolean()
      const stringLiteral = z.literal('hello')

      const intersectionSchema = z.intersection(booleanSchema, stringLiteral)

      expect(() => fake(intersectionSchema)).toThrow(
        'Cannot intersect literal values [hello] with boolean type - types are incompatible',
      )
    })

    it('should throw error for boolean with incompatible type', () => {
      // Boolean with string should be impossible
      const booleanSchema = z.boolean()
      const stringSchema = z.string()

      const intersectionSchema = z.intersection(booleanSchema, stringSchema)

      expect(() => fake(intersectionSchema)).toThrow('Cannot intersect boolean with string')
    })

    it('should handle boolean with any/unknown types', () => {
      // Boolean should work with any/unknown
      const booleanSchema = z.boolean()
      const anySchema = z.any()
      const unknownSchema = z.unknown()

      const booleanAnyIntersection = z.intersection(booleanSchema, anySchema)
      const booleanUnknownIntersection = z.intersection(booleanSchema, unknownSchema)

      const anyResult = fake(booleanAnyIntersection)
      const unknownResult = fake(booleanUnknownIntersection)

      expect(typeof anyResult).toBe('boolean')
      expect(typeof unknownResult).toBe('boolean')
    })
  })

  describe('date intersection handler', () => {
    it('should handle identical date schemas by returning a valid date', () => {
      // Same date schema should intersect to a valid date
      const dateSchema1 = z.date()
      const dateSchema2 = z.date()

      const intersectionSchema = z.intersection(dateSchema1, dateSchema2)
      const result = fake(intersectionSchema)

      expect(result).toBeInstanceOf(Date)
    })

    it('should handle date range constraints by merging them', () => {
      // Date with min/max constraints should merge constraints
      const minDate = z.date().min(new Date('2020-01-01'))
      const maxDate = z.date().max(new Date('2025-12-31'))

      const intersectionSchema = z.intersection(minDate, maxDate)
      const result = fake(intersectionSchema)

      expect(result).toBeInstanceOf(Date)
      expect(result.getTime()).toBeGreaterThanOrEqual(new Date('2020-01-01').getTime())
      expect(result.getTime()).toBeLessThanOrEqual(new Date('2025-12-31').getTime())
    })

    it('should throw error for conflicting date constraints', () => {
      // Conflicting constraints should be impossible
      const minDate = z.date().min(new Date('2025-01-01'))
      const maxDate = z.date().max(new Date('2020-12-31'))

      const intersectionSchema = z.intersection(minDate, maxDate)

      expect(() => fake(intersectionSchema)).toThrow(
        'Cannot intersect date constraints - min date (2025-01-01T00:00:00.000Z) is greater than max date (2020-12-31T00:00:00.000Z)',
      )
    })

    it('should handle date with compatible literal', () => {
      // Date should work with date literal
      const dateSchema = z.date()
      const testDate = new Date('2023-06-15')
      const dateLiteral = z.literal(testDate as any) // Cast needed for v4 literal type constraints

      const intersectionSchema = z.intersection(dateSchema, dateLiteral)
      const result = fake(intersectionSchema)

      expect(result).toEqual(new Date('2023-06-15'))
    })

    it('should throw error for date with incompatible literal', () => {
      // Date with non-date literal should be impossible
      const dateSchema = z.date()
      const stringLiteral = z.literal('hello')

      const intersectionSchema = z.intersection(dateSchema, stringLiteral)

      expect(() => fake(intersectionSchema)).toThrow(
        'Cannot intersect literal values [hello] with date type - types are incompatible',
      )
    })

    it('should throw error for date with incompatible type', () => {
      // Date with string should be impossible
      const dateSchema = z.date()
      const stringSchema = z.string()

      const intersectionSchema = z.intersection(dateSchema, stringSchema)

      expect(() => fake(intersectionSchema)).toThrow('Cannot intersect date with string')
    })

    it('should handle date with any/unknown types', () => {
      // Date should work with any/unknown
      const dateSchema = z.date()
      const anySchema = z.any()
      const unknownSchema = z.unknown()

      const dateAnyIntersection = z.intersection(dateSchema, anySchema)
      const dateUnknownIntersection = z.intersection(dateSchema, unknownSchema)

      const anyResult = fake(dateAnyIntersection)
      const unknownResult = fake(dateUnknownIntersection)

      expect(anyResult).toBeInstanceOf(Date)
      expect(unknownResult).toBeInstanceOf(Date)
    })

    it('should handle complex date constraints', () => {
      // Test multiple constraints together
      const constrainedDate = z.date().min(new Date('2020-01-01')).max(new Date('2025-12-31'))
      const anotherConstrainedDate = z.date().min(new Date('2022-06-01')).max(new Date('2024-06-30'))

      const intersectionSchema = z.intersection(constrainedDate, anotherConstrainedDate)
      const result = fake(intersectionSchema)

      expect(result).toBeInstanceOf(Date)
      expect(result.getTime()).toBeGreaterThanOrEqual(new Date('2022-06-01').getTime()) // max of mins
      expect(result.getTime()).toBeLessThanOrEqual(new Date('2024-06-30').getTime()) // min of maxes
    })
  })

  describe('symbol intersection handler', () => {
    it('should handle identical symbol schemas by returning a valid symbol', () => {
      // Same symbol schema should intersect to a valid symbol
      const symbolSchema1 = z.symbol()
      const symbolSchema2 = z.symbol()

      const intersectionSchema = z.intersection(symbolSchema1, symbolSchema2)
      const result = fake(intersectionSchema)

      expect(typeof result).toBe('symbol')
    })

    it('should handle symbol with compatible literal', () => {
      // Symbol should work with symbol literal
      const symbolSchema = z.symbol()
      const testSymbol = Symbol('test')
      const symbolLiteral = z.literal(testSymbol as any) // Cast needed for v4 literal type constraints

      const intersectionSchema = z.intersection(symbolSchema, symbolLiteral)
      const result = fake(intersectionSchema)

      expect(result).toBe(testSymbol)
    })

    it('should throw error for symbol with incompatible literal', () => {
      // Symbol with non-symbol literal should be impossible
      const symbolSchema = z.symbol()
      const stringLiteral = z.literal('hello')

      const intersectionSchema = z.intersection(symbolSchema, stringLiteral)

      expect(() => fake(intersectionSchema)).toThrow(
        'Cannot intersect literal values [hello] with symbol type - types are incompatible',
      )
    })

    it('should throw error for symbol with incompatible type', () => {
      // Symbol with string should be impossible
      const symbolSchema = z.symbol()
      const stringSchema = z.string()

      const intersectionSchema = z.intersection(symbolSchema, stringSchema)

      expect(() => fake(intersectionSchema)).toThrow('Cannot intersect symbol with string')
    })

    it('should handle symbol with any/unknown types', () => {
      // Symbol should work with any/unknown
      const symbolSchema = z.symbol()
      const anySchema = z.any()
      const unknownSchema = z.unknown()

      const symbolAnyIntersection = z.intersection(symbolSchema, anySchema)
      const symbolUnknownIntersection = z.intersection(symbolSchema, unknownSchema)

      const anyResult = fake(symbolAnyIntersection)
      const unknownResult = fake(symbolUnknownIntersection)

      expect(typeof anyResult).toBe('symbol')
      expect(typeof unknownResult).toBe('symbol')
    })
  })

  describe('Property 2: Constraint merging correctness', () => {
    it('**Feature: v4-intersection, Property 2: Constraint merging correctness**', () => {
      // **Validates: Requirements 2.1**

      // Test constraint merging across same-type schema pairs
      // For any pair of compatible schemas of the same type, intersecting them
      // should produce data that satisfies the merged constraints from both schemas

      // String constraint merging
      const stringMin3 = z.string().min(3)
      const stringMax8 = z.string().max(8)
      const stringIntersection = z.intersection(stringMin3, stringMax8)

      for (let i = 0; i < 10; i++) {
        const result = fake(stringIntersection)
        expect(typeof result).toBe('string')
        expect(result.length).toBeGreaterThanOrEqual(3)
        expect(result.length).toBeLessThanOrEqual(8)
      }

      // Number constraint merging
      const numberMin10 = z.number().min(10)
      const numberMax50 = z.number().max(50)
      const numberIntersection = z.intersection(numberMin10, numberMax50)

      for (let i = 0; i < 10; i++) {
        const result = fake(numberIntersection)
        expect(typeof result).toBe('number')
        expect(result).toBeGreaterThanOrEqual(10)
        expect(result).toBeLessThanOrEqual(50)
      }

      // Bigint constraint merging
      const bigintMin5 = z.bigint().min(5n)
      const bigintMax20 = z.bigint().max(20n)
      const bigintIntersection = z.intersection(bigintMin5, bigintMax20)

      for (let i = 0; i < 10; i++) {
        const result = fake(bigintIntersection)
        expect(typeof result).toBe('bigint')
        expect(result).toBeGreaterThanOrEqual(5n)
        expect(result).toBeLessThanOrEqual(20n)
      }

      // Date constraint merging
      const minDate = new Date('2020-01-01')
      const maxDate = new Date('2025-12-31')
      const dateMin = z.date().min(minDate)
      const dateMax = z.date().max(maxDate)
      const dateIntersection = z.intersection(dateMin, dateMax)

      for (let i = 0; i < 10; i++) {
        const result = fake(dateIntersection)
        expect(result).toBeInstanceOf(Date)
        expect(result.getTime()).toBeGreaterThanOrEqual(minDate.getTime())
        expect(result.getTime()).toBeLessThanOrEqual(maxDate.getTime())
      }

      // Integer constraint merging
      const integerSchema = z.number().int()
      const rangeSchema = z.number().min(1).max(10)
      const integerRangeIntersection = z.intersection(integerSchema, rangeSchema)

      for (let i = 0; i < 10; i++) {
        const result = fake(integerRangeIntersection)
        expect(typeof result).toBe('number')
        expect(Number.isInteger(result)).toBe(true)
        expect(result).toBeGreaterThanOrEqual(1)
        expect(result).toBeLessThanOrEqual(10)
      }

      // Step constraint merging
      const stepSchema = z.number().step(0.5)
      const stepRangeSchema = z.number().min(0).max(5)
      const stepIntersection = z.intersection(stepSchema, stepRangeSchema)

      for (let i = 0; i < 10; i++) {
        const result = fake(stepIntersection)
        expect(typeof result).toBe('number')
        expect(result % 0.5).toBe(0)
        expect(result).toBeGreaterThanOrEqual(0)
        expect(result).toBeLessThanOrEqual(5)
      }
    })
  })

  describe('tuple intersection handler', () => {
    it('should handle identical tuple schemas by returning a valid tuple', () => {
      // Same tuple schema should intersect to a valid tuple
      const tupleSchema1 = z.tuple([z.string(), z.number()])
      const tupleSchema2 = z.tuple([z.string(), z.number()])

      const intersectionSchema = z.intersection(tupleSchema1, tupleSchema2)
      const result = fake(intersectionSchema)

      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(2)
      expect(typeof result[0]).toBe('string')
      expect(typeof result[1]).toBe('number')
    })

    it('should handle compatible tuple element intersections', () => {
      // Tuples with compatible element types should intersect element-wise
      const tuple1 = z.tuple([z.string().min(3), z.number().min(10)])
      const tuple2 = z.tuple([z.string().max(8), z.number().max(50)])

      const intersectionSchema = z.intersection(tuple1, tuple2)
      const result = fake(intersectionSchema)

      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(2)
      expect(typeof result[0]).toBe('string')
      expect(result[0].length).toBeGreaterThanOrEqual(3)
      expect(result[0].length).toBeLessThanOrEqual(8)
      expect(typeof result[1]).toBe('number')
      expect(result[1]).toBeGreaterThanOrEqual(10)
      expect(result[1]).toBeLessThanOrEqual(50)
    })

    it('should throw error for tuples with different lengths', () => {
      // Tuples with different lengths cannot be intersected
      const tuple1 = z.tuple([z.string(), z.number()])
      const tuple2 = z.tuple([z.string(), z.number(), z.boolean()])

      const intersectionSchema = z.intersection(tuple1, tuple2)

      expect(() => fake(intersectionSchema)).toThrow(
        'Cannot intersect tuples with different lengths - left has 2 elements, right has 3 elements',
      )
    })

    it('should throw error for tuples with incompatible element types', () => {
      // Tuples with incompatible element types cannot be intersected
      const tuple1 = z.tuple([z.string(), z.number()])
      const tuple2 = z.tuple([z.number(), z.string()])

      const intersectionSchema = z.intersection(tuple1, tuple2)

      expect(() => fake(intersectionSchema)).toThrow('Cannot intersect string with number')
    })

    it('should handle tuple with compatible literal elements', () => {
      // Tuple should work with literal elements that match types
      const tuple1 = z.tuple([z.string(), z.number()])
      const tuple2 = z.tuple([z.literal('hello'), z.literal(42)])

      const intersectionSchema = z.intersection(tuple1, tuple2)
      const result = fake(intersectionSchema)

      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(2)
      expect(result[0]).toBe('hello')
      expect(result[1]).toBe(42)
    })

    it('should handle tuple with any/unknown element types', () => {
      // Tuple should work with any/unknown element types
      const tuple1 = z.tuple([z.string(), z.number()])
      const tuple2 = z.tuple([z.any(), z.unknown()])

      const intersectionSchema = z.intersection(tuple1, tuple2)
      const result = fake(intersectionSchema)

      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(2)
      expect(typeof result[0]).toBe('string')
      expect(typeof result[1]).toBe('number')
    })

    it('should throw error for tuple with incompatible type', () => {
      // Tuple with non-tuple should be impossible
      const tupleSchema = z.tuple([z.string(), z.number()])
      const stringSchema = z.string()

      const intersectionSchema = z.intersection(tupleSchema, stringSchema)

      expect(() => fake(intersectionSchema)).toThrow('Cannot intersect tuple with string')
    })

    it('should handle empty tuples', () => {
      // Empty tuples should intersect to empty tuple
      const emptyTuple1 = z.tuple([])
      const emptyTuple2 = z.tuple([])

      const intersectionSchema = z.intersection(emptyTuple1, emptyTuple2)
      const result = fake(intersectionSchema)

      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(0)
    })

    it('should handle complex nested tuple intersections', () => {
      // Test nested tuple element intersections with simpler types for now
      // Complex object/array intersections will be handled in later tasks
      const tuple1 = z.tuple([z.string().min(1), z.number().min(0)])
      const tuple2 = z.tuple([z.string().max(10), z.number().max(100)])

      const intersectionSchema = z.intersection(tuple1, tuple2)
      const result = fake(intersectionSchema)

      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(2)
      expect(typeof result[0]).toBe('string')
      expect(result[0].length).toBeGreaterThanOrEqual(1)
      expect(result[0].length).toBeLessThanOrEqual(10)
      expect(typeof result[1]).toBe('number')
      expect(result[1]).toBeGreaterThanOrEqual(0)
      expect(result[1]).toBeLessThanOrEqual(100)
    })
  })

  describe('Property 4: Recursive intersection resolution', () => {
    it('**Feature: v4-intersection, Property 4: Recursive intersection resolution**', () => {
      // **Validates: Requirements 2.4**

      // Test that recursive intersection resolution works correctly
      // This property validates that nested intersections are resolved properly
      // and that the system can handle complex recursive structures

      // Test nested object intersections with multiple levels
      const deepObject1 = z.object({
        level1: z.object({
          level2: z.object({
            value: z.string().min(5),
          }),
        }),
      })

      const deepObject2 = z.object({
        level1: z.object({
          level2: z.object({
            value: z.string().max(15),
            extra: z.number(),
          }),
        }),
      })

      const deepIntersection = z.intersection(deepObject1, deepObject2)
      const deepResult = fake(deepIntersection)

      expect(typeof deepResult).toBe('object')
      expect(typeof deepResult.level1).toBe('object')
      expect(typeof deepResult.level1.level2).toBe('object')
      expect(typeof deepResult.level1.level2.value).toBe('string')
      expect(deepResult.level1.level2.value.length).toBeGreaterThanOrEqual(5)
      expect(deepResult.level1.level2.value.length).toBeLessThanOrEqual(15)
      expect(typeof deepResult.level1.level2.extra).toBe('number')

      // Test nested array intersections with element constraints
      const nestedArray1 = z.array(z.array(z.string().min(3)))
      const nestedArray2 = z.array(z.array(z.string().max(10)))

      const arrayIntersection = z.intersection(nestedArray1, nestedArray2)
      const arrayResult = fake(arrayIntersection)

      expect(Array.isArray(arrayResult)).toBe(true)
      arrayResult.forEach((subArray: any) => {
        expect(Array.isArray(subArray)).toBe(true)
        subArray.forEach((item: any) => {
          expect(typeof item).toBe('string')
          expect(item.length).toBeGreaterThanOrEqual(3)
          expect(item.length).toBeLessThanOrEqual(10)
        })
      })

      // Test tuple with nested object intersections
      const tupleWithObjects1 = z.tuple([z.object({ name: z.string().min(2) }), z.object({ count: z.number().min(0) })])

      const tupleWithObjects2 = z.tuple([
        z.object({ name: z.string().max(20) }),
        z.object({ count: z.number().max(100) }),
      ])

      const tupleIntersection = z.intersection(tupleWithObjects1, tupleWithObjects2)
      const tupleResult = fake(tupleIntersection)

      expect(Array.isArray(tupleResult)).toBe(true)
      expect(tupleResult).toHaveLength(2)
      expect(typeof tupleResult[0]).toBe('object')
      expect(typeof tupleResult[0].name).toBe('string')
      expect(tupleResult[0].name.length).toBeGreaterThanOrEqual(2)
      expect(tupleResult[0].name.length).toBeLessThanOrEqual(20)
      expect(typeof tupleResult[1]).toBe('object')
      expect(typeof tupleResult[1].count).toBe('number')
      expect(tupleResult[1].count).toBeGreaterThanOrEqual(0)
      expect(tupleResult[1].count).toBeLessThanOrEqual(100)

      // Test record with nested intersections
      const recordWithNested1 = z.record(z.string(), z.object({ value: z.number().min(10) }))
      const recordWithNested2 = z.record(z.string(), z.object({ value: z.number().max(50) }))

      const recordIntersection = z.intersection(recordWithNested1, recordWithNested2)
      const recordResult = fake(recordIntersection)

      expect(typeof recordResult).toBe('object')
      expect(recordResult).not.toBeNull()
      Object.keys(recordResult).forEach(key => {
        expect(typeof key).toBe('string')
        expect(typeof recordResult[key]).toBe('object')
        expect(typeof recordResult[key].value).toBe('number')
        expect(recordResult[key].value).toBeGreaterThanOrEqual(10)
        expect(recordResult[key].value).toBeLessThanOrEqual(50)
      })

      // Test map with nested intersections
      const mapWithNested1 = z.map(z.string(), z.object({ data: z.string().min(1) }))
      const mapWithNested2 = z.map(z.string(), z.object({ data: z.string().max(100) }))

      const mapIntersection = z.intersection(mapWithNested1, mapWithNested2)
      const mapResult = fake(mapIntersection)

      expect(mapResult instanceof Map).toBe(true)
      mapResult.forEach((value, key) => {
        expect(typeof key).toBe('string')
        expect(typeof value).toBe('object')
        expect(typeof value.data).toBe('string')
        expect(value.data.length).toBeGreaterThanOrEqual(1)
        expect(value.data.length).toBeLessThanOrEqual(100)
      })

      // Test set with nested intersections
      const setWithNested1 = z.set(z.object({ id: z.number().min(1) }))
      const setWithNested2 = z.set(z.object({ id: z.number().max(1000) }))

      const setIntersection = z.intersection(setWithNested1, setWithNested2)
      const setResult = fake(setIntersection)

      expect(setResult instanceof Set).toBe(true)
      setResult.forEach(value => {
        expect(typeof value).toBe('object')
        expect(typeof value.id).toBe('number')
        expect(value.id).toBeGreaterThanOrEqual(1)
        expect(value.id).toBeLessThanOrEqual(1000)
      })

      // Test complex mixed nested structure
      const complexNested1 = z.object({
        users: z.array(
          z.object({
            profile: z.object({
              name: z.string().min(1),
              settings: z.record(z.string(), z.boolean()),
            }),
          }),
        ),
      })

      const complexNested2 = z.object({
        users: z.array(
          z.object({
            profile: z.object({
              name: z.string().max(50),
              age: z.number().min(0),
            }),
          }),
        ),
      })

      const complexIntersection = z.intersection(complexNested1, complexNested2)
      const complexResult = fake(complexIntersection)

      expect(typeof complexResult).toBe('object')
      expect(Array.isArray(complexResult.users)).toBe(true)
      complexResult.users.forEach((user: any) => {
        expect(typeof user).toBe('object')
        expect(typeof user.profile).toBe('object')
        expect(typeof user.profile.name).toBe('string')
        expect(user.profile.name.length).toBeGreaterThanOrEqual(1)
        expect(user.profile.name.length).toBeLessThanOrEqual(50)
        expect(typeof user.profile.settings).toBe('object')
        expect(typeof user.profile.age).toBe('number')
        expect(user.profile.age).toBeGreaterThanOrEqual(0)
      })
    })
  })
})
describe('object intersection handler', () => {
  it('should handle identical object schemas by returning a valid object', () => {
    // Same object schema should intersect to a valid object
    const objectSchema1 = z.object({ name: z.string(), age: z.number() })
    const objectSchema2 = z.object({ name: z.string(), age: z.number() })

    const intersectionSchema = z.intersection(objectSchema1, objectSchema2)
    const result = fake(intersectionSchema)

    expect(typeof result).toBe('object')
    expect(result).not.toBeNull()
    expect(typeof result.name).toBe('string')
    expect(typeof result.age).toBe('number')
  })

  it('should handle object shape merging by combining properties', () => {
    // Objects with different properties should merge their shapes
    const object1 = z.object({ name: z.string(), age: z.number() })
    const object2 = z.object({ email: z.string(), active: z.boolean() })

    const intersectionSchema = z.intersection(object1, object2)
    const result = fake(intersectionSchema)

    expect(typeof result).toBe('object')
    expect(result).not.toBeNull()
    expect(typeof result.name).toBe('string')
    expect(typeof result.age).toBe('number')
    expect(typeof result.email).toBe('string')
    expect(typeof result.active).toBe('boolean')
  })

  it('should handle overlapping object properties by intersecting property types', () => {
    // Objects with same property names should intersect the property types
    const object1 = z.object({ name: z.string().min(3), count: z.number().min(0) })
    const object2 = z.object({ name: z.string().max(10), count: z.number().max(100) })

    const intersectionSchema = z.intersection(object1, object2)
    const result = fake(intersectionSchema)

    expect(typeof result).toBe('object')
    expect(result).not.toBeNull()
    expect(typeof result.name).toBe('string')
    expect(result.name.length).toBeGreaterThanOrEqual(3)
    expect(result.name.length).toBeLessThanOrEqual(10)
    expect(typeof result.count).toBe('number')
    expect(result.count).toBeGreaterThanOrEqual(0)
    expect(result.count).toBeLessThanOrEqual(100)
  })

  it('should throw error for conflicting property types', () => {
    // Objects with same property names but incompatible types should fail
    const object1 = z.object({ value: z.string() })
    const object2 = z.object({ value: z.number() })

    const intersectionSchema = z.intersection(object1, object2)

    expect(() => fake(intersectionSchema)).toThrow('Cannot intersect string with number')
  })

  it('should handle object with compatible literal properties', () => {
    // Object should work with literal properties that match types
    const object1 = z.object({ name: z.string(), status: z.string() })
    const object2 = z.object({ name: z.literal('John'), status: z.literal('active') })

    const intersectionSchema = z.intersection(object1, object2)
    const result = fake(intersectionSchema)

    expect(typeof result).toBe('object')
    expect(result).not.toBeNull()
    expect(result.name).toBe('John')
    expect(result.status).toBe('active')
  })

  it('should handle object with any/unknown properties', () => {
    // Object should work with any/unknown property types
    const object1 = z.object({ name: z.string(), data: z.any() })
    const object2 = z.object({ name: z.string(), data: z.unknown() })

    const intersectionSchema = z.intersection(object1, object2)
    const result = fake(intersectionSchema)

    expect(typeof result).toBe('object')
    expect(result).not.toBeNull()
    expect(typeof result.name).toBe('string')
    expect(result.data).toBeDefined()
  })

  it('should throw error for object with incompatible type', () => {
    // Object with non-object should be impossible
    const objectSchema = z.object({ name: z.string() })
    const stringSchema = z.string()

    const intersectionSchema = z.intersection(objectSchema, stringSchema)

    expect(() => fake(intersectionSchema)).toThrow('Cannot intersect object with string')
  })

  it('should handle strict mode objects', () => {
    // Test strict mode object intersection behavior
    const object1 = z.object({ name: z.string() }).strict()
    const object2 = z.object({ age: z.number() }).strict()

    const intersectionSchema = z.intersection(object1, object2)
    const result = fake(intersectionSchema)

    expect(typeof result).toBe('object')
    expect(result).not.toBeNull()
    expect(typeof result.name).toBe('string')
    expect(typeof result.age).toBe('number')
    // Should only have the defined properties
    expect(Object.keys(result)).toEqual(expect.arrayContaining(['name', 'age']))
  })

  it('should handle objects with catchall properties', () => {
    // Test object intersection with catchall (passthrough) behavior
    const object1 = z.object({ name: z.string() }).passthrough()
    const object2 = z.object({ age: z.number() })

    const intersectionSchema = z.intersection(object1, object2)
    const result = fake(intersectionSchema)

    expect(typeof result).toBe('object')
    expect(result).not.toBeNull()
    expect(typeof result.name).toBe('string')
    expect(typeof result.age).toBe('number')
  })

  it('should handle complex nested object intersections', () => {
    // Test nested object property intersections
    const object1 = z.object({
      user: z.object({ name: z.string().min(1) }),
      settings: z.object({ theme: z.string() }),
    })
    const object2 = z.object({
      user: z.object({ name: z.string().max(20) }),
      settings: z.object({ notifications: z.boolean() }),
    })

    const intersectionSchema = z.intersection(object1, object2)
    const result = fake(intersectionSchema)

    expect(typeof result).toBe('object')
    expect(result).not.toBeNull()
    expect(typeof result.user).toBe('object')
    expect(typeof result.user.name).toBe('string')
    expect(result.user.name.length).toBeGreaterThanOrEqual(1)
    expect(result.user.name.length).toBeLessThanOrEqual(20)
    expect(typeof result.settings).toBe('object')
    expect(typeof result.settings.theme).toBe('string')
    expect(typeof result.settings.notifications).toBe('boolean')
  })
})

describe('array intersection handler', () => {
  it('should handle identical array schemas by returning a valid array', () => {
    const array1 = z.array(z.string())
    const array2 = z.array(z.string())

    const intersectionSchema = z.intersection(array1, array2)
    const result = fake(intersectionSchema)

    expect(Array.isArray(result)).toBe(true)
    result.forEach((item: any) => {
      expect(typeof item).toBe('string')
    })
  })

  it('should handle array length constraints by merging them', () => {
    const array1 = z.array(z.string()).min(2).max(5)
    const array2 = z.array(z.string()).min(3).max(4)

    const intersectionSchema = z.intersection(array1, array2)
    const result = fake(intersectionSchema)

    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThanOrEqual(3)
    expect(result.length).toBeLessThanOrEqual(4)
    result.forEach((item: any) => {
      expect(typeof item).toBe('string')
    })
  })

  it('should throw error for conflicting length constraints', () => {
    const array1 = z.array(z.string()).min(5).max(10)
    const array2 = z.array(z.string()).min(15).max(20)

    expect(() => {
      const intersectionSchema = z.intersection(array1, array2)
      fake(intersectionSchema)
    }).toThrow('Cannot intersect array constraints')
  })

  it('should handle array element type intersections', () => {
    const array1 = z.array(z.string().min(3))
    const array2 = z.array(z.string().max(10))

    const intersectionSchema = z.intersection(array1, array2)
    const result = fake(intersectionSchema)

    expect(Array.isArray(result)).toBe(true)
    result.forEach((item: any) => {
      expect(typeof item).toBe('string')
      expect(item.length).toBeGreaterThanOrEqual(3)
      expect(item.length).toBeLessThanOrEqual(10)
    })
  })

  it('should throw error for incompatible element types', () => {
    const array1 = z.array(z.string())
    const array2 = z.array(z.number())

    expect(() => {
      const intersectionSchema = z.intersection(array1, array2)
      fake(intersectionSchema)
    }).toThrow('Cannot intersect array element types')
  })

  it('should handle array with any/unknown element types', () => {
    const array1 = z.array(z.string())
    const array2 = z.array(z.any())

    const intersectionSchema = z.intersection(array1, array2)
    const result = fake(intersectionSchema)

    expect(Array.isArray(result)).toBe(true)
    result.forEach((item: any) => {
      expect(typeof item).toBe('string')
    })
  })

  it('should throw error for array with incompatible type', () => {
    const array1 = z.array(z.string())
    const object1 = z.object({ name: z.string() })

    expect(() => {
      const intersectionSchema = z.intersection(array1, object1)
      fake(intersectionSchema)
    }).toThrow('Cannot intersect array with object')
  })

  it('should handle nested array intersections', () => {
    const array1 = z.array(z.array(z.string()))
    const array2 = z.array(z.array(z.string().min(2)))

    const intersectionSchema = z.intersection(array1, array2)
    const result = fake(intersectionSchema)

    expect(Array.isArray(result)).toBe(true)
    result.forEach((subArray: any) => {
      expect(Array.isArray(subArray)).toBe(true)
      subArray.forEach((item: any) => {
        expect(typeof item).toBe('string')
        expect(item.length).toBeGreaterThanOrEqual(2)
      })
    })
  })

  it('should handle empty array constraints', () => {
    const array1 = z.array(z.string()).length(0)
    const array2 = z.array(z.string()).max(0)

    const intersectionSchema = z.intersection(array1, array2)
    const result = fake(intersectionSchema)

    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(0)
  })
})

describe('record intersection handler', () => {
  it('should handle identical record schemas by returning a valid record', () => {
    const record1 = z.record(z.string(), z.number())
    const record2 = z.record(z.string(), z.number())

    const intersectionSchema = z.intersection(record1, record2)
    const result = fake(intersectionSchema)

    expect(typeof result).toBe('object')
    expect(result).not.toBeNull()
    Object.keys(result).forEach(key => {
      expect(typeof key).toBe('string')
      expect(typeof result[key]).toBe('number')
    })
  })

  it('should handle record key type intersections', () => {
    const record1 = z.record(z.string().min(3), z.number())
    const record2 = z.record(z.string().max(10), z.number())

    const intersectionSchema = z.intersection(record1, record2)
    const result = fake(intersectionSchema)

    expect(typeof result).toBe('object')
    expect(result).not.toBeNull()
    Object.keys(result).forEach(key => {
      expect(typeof key).toBe('string')
      expect(key.length).toBeGreaterThanOrEqual(3)
      expect(key.length).toBeLessThanOrEqual(10)
      expect(typeof result[key]).toBe('number')
    })
  })

  it('should handle record value type intersections', () => {
    const record1 = z.record(z.string(), z.number().min(0))
    const record2 = z.record(z.string(), z.number().max(100))

    const intersectionSchema = z.intersection(record1, record2)
    const result = fake(intersectionSchema)

    expect(typeof result).toBe('object')
    expect(result).not.toBeNull()
    Object.keys(result).forEach(key => {
      expect(typeof key).toBe('string')
      expect(typeof result[key]).toBe('number')
      expect(result[key]).toBeGreaterThanOrEqual(0)
      expect(result[key]).toBeLessThanOrEqual(100)
    })
  })

  it('should throw error for incompatible key types', () => {
    const record1 = z.record(z.string(), z.number())
    const record2 = z.record(z.number(), z.number())

    expect(() => {
      const intersectionSchema = z.intersection(record1, record2)
      fake(intersectionSchema)
    }).toThrow()
  })

  it('should throw error for incompatible value types', () => {
    const record1 = z.record(z.string(), z.string())
    const record2 = z.record(z.string(), z.number())

    expect(() => {
      const intersectionSchema = z.intersection(record1, record2)
      fake(intersectionSchema)
    }).toThrow()
  })

  it('should handle record with any/unknown key types', () => {
    const record1 = z.record(z.string(), z.number())
    const record2 = z.record(z.any(), z.number())

    const intersectionSchema = z.intersection(record1, record2)
    const result = fake(intersectionSchema)

    expect(typeof result).toBe('object')
    expect(result).not.toBeNull()
    Object.keys(result).forEach(key => {
      expect(typeof key).toBe('string')
      expect(typeof result[key]).toBe('number')
    })
  })

  it('should handle record with any/unknown value types', () => {
    const record1 = z.record(z.string(), z.number())
    const record2 = z.record(z.string(), z.any())

    const intersectionSchema = z.intersection(record1, record2)
    const result = fake(intersectionSchema)

    expect(typeof result).toBe('object')
    expect(result).not.toBeNull()
    Object.keys(result).forEach(key => {
      expect(typeof key).toBe('string')
      expect(typeof result[key]).toBe('number')
    })
  })

  it('should throw error for record with incompatible type', () => {
    const record1 = z.record(z.string(), z.number())
    const array1 = z.array(z.string())

    expect(() => {
      const intersectionSchema = z.intersection(record1, array1)
      fake(intersectionSchema)
    }).toThrow('Cannot intersect record with array')
  })

  it('should handle nested record intersections', () => {
    const record1 = z.record(z.string(), z.record(z.string(), z.number()))
    const record2 = z.record(z.string(), z.record(z.string(), z.number().min(0)))

    const intersectionSchema = z.intersection(record1, record2)
    const result = fake(intersectionSchema)

    expect(typeof result).toBe('object')
    expect(result).not.toBeNull()
    Object.keys(result).forEach(key => {
      expect(typeof key).toBe('string')
      expect(typeof result[key]).toBe('object')
      Object.keys(result[key]).forEach(nestedKey => {
        expect(typeof nestedKey).toBe('string')
        expect(typeof result[key][nestedKey]).toBe('number')
        expect(result[key][nestedKey]).toBeGreaterThanOrEqual(0)
      })
    })
  })
})

describe('map intersection handler', () => {
  it('should handle identical map schemas by returning a valid map', () => {
    const map1 = z.map(z.string(), z.number())
    const map2 = z.map(z.string(), z.number())

    const intersectionSchema = z.intersection(map1, map2)
    const result = fake(intersectionSchema)

    expect(result instanceof Map).toBe(true)
    result.forEach((value, key) => {
      expect(typeof key).toBe('string')
      expect(typeof value).toBe('number')
    })
  })

  it('should handle map key type intersections', () => {
    const map1 = z.map(z.string().min(3), z.number())
    const map2 = z.map(z.string().max(10), z.number())

    const intersectionSchema = z.intersection(map1, map2)
    const result = fake(intersectionSchema)

    expect(result instanceof Map).toBe(true)
    result.forEach((value, key) => {
      expect(typeof key).toBe('string')
      expect(key.length).toBeGreaterThanOrEqual(3)
      expect(key.length).toBeLessThanOrEqual(10)
      expect(typeof value).toBe('number')
    })
  })

  it('should handle map value type intersections', () => {
    const map1 = z.map(z.string(), z.number().min(0))
    const map2 = z.map(z.string(), z.number().max(100))

    const intersectionSchema = z.intersection(map1, map2)
    const result = fake(intersectionSchema)

    expect(result instanceof Map).toBe(true)
    result.forEach((value, key) => {
      expect(typeof key).toBe('string')
      expect(typeof value).toBe('number')
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThanOrEqual(100)
    })
  })

  it('should throw error for incompatible key types', () => {
    const map1 = z.map(z.string(), z.number())
    const map2 = z.map(z.number(), z.number())

    expect(() => {
      const intersectionSchema = z.intersection(map1, map2)
      fake(intersectionSchema)
    }).toThrow()
  })

  it('should throw error for incompatible value types', () => {
    const map1 = z.map(z.string(), z.string())
    const map2 = z.map(z.string(), z.number())

    expect(() => {
      const intersectionSchema = z.intersection(map1, map2)
      fake(intersectionSchema)
    }).toThrow()
  })

  it('should handle map with any/unknown key types', () => {
    const map1 = z.map(z.string(), z.number())
    const map2 = z.map(z.any(), z.number())

    const intersectionSchema = z.intersection(map1, map2)
    const result = fake(intersectionSchema)

    expect(result instanceof Map).toBe(true)
    result.forEach((value, key) => {
      expect(typeof key).toBe('string')
      expect(typeof value).toBe('number')
    })
  })

  it('should handle map with any/unknown value types', () => {
    const map1 = z.map(z.string(), z.number())
    const map2 = z.map(z.string(), z.any())

    const intersectionSchema = z.intersection(map1, map2)
    const result = fake(intersectionSchema)

    expect(result instanceof Map).toBe(true)
    result.forEach((value, key) => {
      expect(typeof key).toBe('string')
      expect(typeof value).toBe('number')
    })
  })

  it('should throw error for map with incompatible type', () => {
    const map1 = z.map(z.string(), z.number())
    const array1 = z.array(z.string())

    expect(() => {
      const intersectionSchema = z.intersection(map1, array1)
      fake(intersectionSchema)
    }).toThrow('Cannot intersect map with array')
  })

  it('should handle nested map intersections', () => {
    const map1 = z.map(z.string(), z.map(z.string(), z.number()))
    const map2 = z.map(z.string(), z.map(z.string(), z.number().min(0)))

    const intersectionSchema = z.intersection(map1, map2)
    const result = fake(intersectionSchema)

    expect(result instanceof Map).toBe(true)
    result.forEach((value, key) => {
      expect(typeof key).toBe('string')
      expect(value instanceof Map).toBe(true)
      value.forEach((nestedValue, nestedKey) => {
        expect(typeof nestedKey).toBe('string')
        expect(typeof nestedValue).toBe('number')
        expect(nestedValue).toBeGreaterThanOrEqual(0)
      })
    })
  })
})

describe('union intersection handler', () => {
  it('should handle union with compatible type by filtering union options', () => {
    // Union intersected with compatible type should filter to matching options
    const unionSchema = z.union([z.string(), z.number(), z.boolean()])
    const stringSchema = z.string()

    const intersectionSchema = z.intersection(unionSchema, stringSchema)
    const result = fake(intersectionSchema)

    expect(typeof result).toBe('string')
  })

  it('should handle union with literal by filtering to compatible options', () => {
    // Union intersected with literal should filter to options that can contain the literal
    const unionSchema = z.union([z.string(), z.number()])
    const stringLiteral = z.literal('hello')

    const intersectionSchema = z.intersection(unionSchema, stringLiteral)
    const result = fake(intersectionSchema)

    expect(result).toBe('hello')
  })

  it('should handle union with enum by filtering to compatible options', () => {
    // Union intersected with enum should filter to options that can contain enum values
    const unionSchema = z.union([z.string(), z.number()])
    const colorEnum = z.enum(['red', 'green', 'blue'])

    const intersectionSchema = z.intersection(unionSchema, colorEnum)
    const result = fake(intersectionSchema)

    expect(['red', 'green', 'blue']).toContain(result)
    expect(typeof result).toBe('string')
  })

  it('should handle union with another union by finding compatible combinations', () => {
    // Union intersected with another union should find compatible type combinations
    const union1 = z.union([z.string(), z.number()])
    const union2 = z.union([z.string(), z.boolean()])

    const intersectionSchema = z.intersection(union1, union2)
    const result = fake(intersectionSchema)

    // Should return string since it's the only common type
    expect(typeof result).toBe('string')
  })

  it('should throw error for union with no compatible options', () => {
    // Union with no compatible options should be impossible
    const unionSchema = z.union([z.string(), z.boolean()])
    const numberSchema = z.number()

    const intersectionSchema = z.intersection(unionSchema, numberSchema)

    expect(() => fake(intersectionSchema)).toThrow('Cannot intersect number with union - no compatible union options')
  })

  it('should handle union with any/unknown types', () => {
    // Union should work with any/unknown by returning one of the union options
    const unionSchema = z.union([z.string(), z.number()])
    const anySchema = z.any()
    const unknownSchema = z.unknown()

    const unionAnyIntersection = z.intersection(unionSchema, anySchema)
    const unionUnknownIntersection = z.intersection(unionSchema, unknownSchema)

    const anyResult = fake(unionAnyIntersection)
    const unknownResult = fake(unionUnknownIntersection)

    expect(['string', 'number']).toContain(typeof anyResult)
    expect(['string', 'number']).toContain(typeof unknownResult)
  })

  it('should handle union with constrained types by filtering and applying constraints', () => {
    // Union with constrained types should filter to compatible options and apply constraints
    const unionSchema = z.union([z.string(), z.number()])
    const constrainedString = z.string().min(5)

    const intersectionSchema = z.intersection(unionSchema, constrainedString)
    const result = fake(intersectionSchema)

    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThanOrEqual(5)
  })

  it('should handle complex union intersections with multiple constraints', () => {
    // Test complex union filtering with multiple constraint types
    const complexUnion = z.union([z.string().min(1), z.number().min(0), z.boolean()])
    const stringConstraint = z.string().max(10)

    const intersectionSchema = z.intersection(complexUnion, stringConstraint)
    const result = fake(intersectionSchema)

    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThanOrEqual(1)
    expect(result.length).toBeLessThanOrEqual(10)
  })

  it('should handle union with object types by filtering to compatible shapes', () => {
    // Union with object types should filter to compatible object shapes
    const unionSchema = z.union([z.object({ name: z.string() }), z.string(), z.number()])
    const objectSchema = z.object({ age: z.number() })

    const intersectionSchema = z.intersection(unionSchema, objectSchema)
    const result = fake(intersectionSchema)

    expect(typeof result).toBe('object')
    expect(result).not.toBeNull()
    // The result should be an object with both name and age properties
    // since only the object option from the union is compatible
    expect(result).toHaveProperty('name')
    expect(result).toHaveProperty('age')
    expect(typeof (result as any).name).toBe('string')
    expect(typeof (result as any).age).toBe('number')
  })

  it('should handle union with array types by filtering to compatible element types', () => {
    // Union with array types should filter to compatible array element types
    const unionSchema = z.union([z.array(z.string()), z.string(), z.number()])
    const arraySchema = z.array(z.string().min(3))

    const intersectionSchema = z.intersection(unionSchema, arraySchema)
    const result = fake(intersectionSchema)

    expect(Array.isArray(result)).toBe(true)
    result.forEach((item: any) => {
      expect(typeof item).toBe('string')
      expect(item.length).toBeGreaterThanOrEqual(3)
    })
  })

  it('should handle nested union intersections', () => {
    // Test nested union structures with intersections
    const nestedUnion1 = z.union([z.union([z.string(), z.number()]), z.boolean()])
    const nestedUnion2 = z.union([z.string(), z.union([z.number(), z.date()])])

    const intersectionSchema = z.intersection(nestedUnion1, nestedUnion2)
    const result = fake(intersectionSchema)

    // Should return string or number (the common types)
    expect(['string', 'number']).toContain(typeof result)
  })

  it('should handle union with never type by filtering out never', () => {
    // Union containing never should filter out the never option
    const unionSchema = z.union([z.string(), z.never()])
    const stringSchema = z.string()

    const intersectionSchema = z.intersection(unionSchema, stringSchema)
    const result = fake(intersectionSchema)

    expect(typeof result).toBe('string')
  })

  it('should throw error when all union options are filtered out', () => {
    // When all union options are incompatible, should throw error
    const unionSchema = z.union([z.string(), z.boolean()])
    const numberSchema = z.number()

    const intersectionSchema = z.intersection(unionSchema, numberSchema)

    expect(() => fake(intersectionSchema)).toThrow('Cannot intersect number with union - no compatible union options')
  })
})

describe('lazy intersection handler', () => {
  it('should handle lazy with compatible type by resolving deferred schema', () => {
    // Lazy intersected with compatible type should resolve the lazy schema first
    const lazyStringSchema = z.lazy(() => z.string())
    const stringSchema = z.string().min(5)

    const intersectionSchema = z.intersection(lazyStringSchema, stringSchema)
    const result = fake(intersectionSchema)

    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThanOrEqual(5)
  })

  it('should handle lazy with literal by resolving and checking compatibility', () => {
    // Lazy intersected with literal should resolve lazy schema and check compatibility
    const lazyStringSchema = z.lazy(() => z.string())
    const stringLiteral = z.literal('hello')

    const intersectionSchema = z.intersection(lazyStringSchema, stringLiteral)
    const result = fake(intersectionSchema)

    expect(result).toBe('hello')
  })

  it('should handle lazy with another lazy by resolving both schemas', () => {
    // Lazy intersected with another lazy should resolve both schemas
    const lazyString1 = z.lazy(() => z.string().min(3))
    const lazyString2 = z.lazy(() => z.string().max(10))

    const intersectionSchema = z.intersection(lazyString1, lazyString2)
    const result = fake(intersectionSchema)

    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThanOrEqual(3)
    expect(result.length).toBeLessThanOrEqual(10)
  })

  it('should throw error for lazy with incompatible type', () => {
    // Lazy with incompatible type should throw error after resolution
    const lazyStringSchema = z.lazy(() => z.string())
    const numberSchema = z.number()

    const intersectionSchema = z.intersection(lazyStringSchema, numberSchema)

    expect(() => fake(intersectionSchema)).toThrow(/Cannot intersect (string with number|number with string)/)
  })

  it('should handle lazy with any/unknown types', () => {
    // Lazy should work with any/unknown by resolving the lazy schema
    const lazyNumberSchema = z.lazy(() => z.number())
    const anySchema = z.any()
    const unknownSchema = z.unknown()

    const lazyAnyIntersection = z.intersection(lazyNumberSchema, anySchema)
    const lazyUnknownIntersection = z.intersection(lazyNumberSchema, unknownSchema)

    const anyResult = fake(lazyAnyIntersection)
    const unknownResult = fake(lazyUnknownIntersection)

    expect(typeof anyResult).toBe('number')
    expect(typeof unknownResult).toBe('number')
  })

  it('should handle recursive lazy schemas', () => {
    // Test recursive lazy schema intersection
    type Node = {
      value: string
      children?: Node[]
    }

    const nodeSchema: z.ZodType<Node> = z.lazy(() =>
      z.object({
        value: z.string(),
        children: z.array(nodeSchema).optional(),
      }),
    )

    const constraintSchema = z.object({
      value: z.string().min(3),
    })

    const intersectionSchema = z.intersection(nodeSchema, constraintSchema)
    const result = fake(intersectionSchema)

    expect(typeof result).toBe('object')
    expect(result).not.toBeNull()
    expect(typeof result.value).toBe('string')
    expect(result.value.length).toBeGreaterThanOrEqual(3)
  })

  it('should handle lazy with object types by resolving and merging shapes', () => {
    // Lazy object intersected with another object should merge shapes
    const lazyObjectSchema = z.lazy(() => z.object({ name: z.string() }))
    const objectSchema = z.object({ age: z.number() })

    const intersectionSchema = z.intersection(lazyObjectSchema, objectSchema)
    const result = fake(intersectionSchema)

    expect(typeof result).toBe('object')
    expect(result).not.toBeNull()
    expect(typeof (result as any).name).toBe('string')
    expect(typeof (result as any).age).toBe('number')
  })

  it('should handle lazy with array types by resolving and merging constraints', () => {
    // Lazy array intersected with another array should merge constraints
    const lazyArraySchema = z.lazy(() => z.array(z.string()))
    const arraySchema = z.array(z.string().min(2))

    const intersectionSchema = z.intersection(lazyArraySchema, arraySchema)
    const result = fake(intersectionSchema)

    expect(Array.isArray(result)).toBe(true)
    result.forEach((item: any) => {
      expect(typeof item).toBe('string')
      expect(item.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('should handle complex nested lazy intersections', () => {
    // Test complex nested lazy structures
    const lazyComplexSchema = z.lazy(() =>
      z.object({
        data: z.array(z.object({ id: z.string() })),
      }),
    )

    const constraintSchema = z.object({
      data: z.array(z.object({ id: z.string().min(5) })),
    })

    const intersectionSchema = z.intersection(lazyComplexSchema, constraintSchema)
    const result = fake(intersectionSchema)

    expect(typeof result).toBe('object')
    expect(result).not.toBeNull()
    expect(Array.isArray((result as any).data)).toBe(true)
    ;(result as any).data.forEach((item: any) => {
      expect(typeof item).toBe('object')
      expect(typeof item.id).toBe('string')
      expect(item.id.length).toBeGreaterThanOrEqual(5)
    })
  })

  it('should handle lazy schema resolution errors gracefully', () => {
    // Test error handling when lazy schema resolution fails
    const problematicLazySchema = z.lazy(() => {
      throw new Error('Lazy schema resolution failed')
    })
    const stringSchema = z.string()

    const intersectionSchema = z.intersection(problematicLazySchema, stringSchema)

    expect(() => fake(intersectionSchema)).toThrow('Lazy schema resolution failed')
  })
})

describe('pipe intersection handler', () => {
  it('should handle pipe with compatible type by using input schema', () => {
    // Pipe intersected with compatible type should use the input schema for intersection
    const pipeSchema = z.string().pipe(z.string().transform(s => s.toUpperCase()))
    const stringSchema = z.string().min(5)

    const intersectionSchema = z.intersection(pipeSchema, stringSchema)
    const result = fake(intersectionSchema)

    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThanOrEqual(5)
  })

  it('should handle pipe with literal by checking input schema compatibility', () => {
    // Pipe intersected with literal should check if literal is compatible with input schema
    const pipeSchema = z.string().pipe(z.string().transform(s => s.toUpperCase()))
    const stringLiteral = z.literal('hello')

    const intersectionSchema = z.intersection(pipeSchema, stringLiteral)
    const result = fake(intersectionSchema)

    expect(result).toBe('hello')
  })

  it('should handle pipe with another pipe by intersecting input schemas', () => {
    // Pipe intersected with another pipe should intersect their input schemas
    const pipe1 = z.string().min(3).pipe(z.string().transform(s => s.toUpperCase()))
    const pipe2 = z.string().max(10).pipe(z.string().transform(s => s.toLowerCase()))

    const intersectionSchema = z.intersection(pipe1, pipe2)
    const result = fake(intersectionSchema)

    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThanOrEqual(3)
    expect(result.length).toBeLessThanOrEqual(10)
  })

  it('should throw error for pipe with incompatible type', () => {
    // Pipe with incompatible type should throw error based on input schema
    const pipeSchema = z.string().pipe(z.string().transform(s => s.toUpperCase()))
    const numberSchema = z.number()

    const intersectionSchema = z.intersection(pipeSchema, numberSchema)

    expect(() => fake(intersectionSchema)).toThrow(/Cannot intersect (string with number|number with string)/)
  })

  it('should handle pipe with any/unknown types', () => {
    // Pipe should work with any/unknown by using input schema
    const pipeSchema = z.number().pipe(z.number().transform(n => n * 2))
    const anySchema = z.any()
    const unknownSchema = z.unknown()

    const pipeAnyIntersection = z.intersection(pipeSchema, anySchema)
    const pipeUnknownIntersection = z.intersection(pipeSchema, unknownSchema)

    const anyResult = fake(pipeAnyIntersection)
    const unknownResult = fake(pipeUnknownIntersection)

    expect(typeof anyResult).toBe('number')
    expect(typeof unknownResult).toBe('number')
  })

  it('should handle pipe with object types by intersecting input schema', () => {
    // Pipe object intersected with another object should intersect input schemas
    const pipeSchema = z.object({ name: z.string() }).pipe(z.object({ name: z.string() }).transform(obj => ({ ...obj, processed: true })))
    const objectSchema = z.object({ age: z.number() })

    const intersectionSchema = z.intersection(pipeSchema, objectSchema)
    const result = fake(intersectionSchema)

    expect(typeof result).toBe('object')
    expect(result).not.toBeNull()
    expect(typeof (result as any).name).toBe('string')
    expect(typeof (result as any).age).toBe('number')
  })

  it('should handle pipe with array types by intersecting input schema', () => {
    // Pipe array intersected with another array should intersect input schemas
    const pipeSchema = z.array(z.string()).pipe(z.array(z.string()).transform(arr => arr.map(s => s.toUpperCase())))
    const arraySchema = z.array(z.string().min(2))

    const intersectionSchema = z.intersection(pipeSchema, arraySchema)
    const result = fake(intersectionSchema)

    expect(Array.isArray(result)).toBe(true)
    result.forEach((item: any) => {
      expect(typeof item).toBe('string')
      expect(item.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('should handle complex nested pipe intersections', () => {
    // Test complex nested pipe structures
    const pipeSchema = z.object({
      data: z.array(z.object({ id: z.string() }))
    }).pipe(z.object({
      data: z.array(z.object({ id: z.string() }))
    }).transform(obj => ({ ...obj, processed: true })))

    const constraintSchema = z.object({
      data: z.array(z.object({ id: z.string().min(5) }))
    })

    const intersectionSchema = z.intersection(pipeSchema, constraintSchema)
    const result = fake(intersectionSchema)

    expect(typeof result).toBe('object')
    expect(result).not.toBeNull()
    expect(Array.isArray((result as any).data)).toBe(true)
    ;(result as any).data.forEach((item: any) => {
      expect(typeof item.id).toBe('string')
      expect(item.id.length).toBeGreaterThanOrEqual(5)
    })
  })

  it('should handle pipe with union types by intersecting input schema', () => {
    // Pipe intersected with union should intersect input schema with union
    const pipeSchema = z.string().pipe(z.string().transform(s => s.toUpperCase()))
    const unionSchema = z.union([z.string(), z.number()])

    const intersectionSchema = z.intersection(pipeSchema, unionSchema)
    const result = fake(intersectionSchema)

    expect(typeof result).toBe('string')
  })
})

describe('optional intersection handler', () => {
  it('should handle optional with compatible type by preserving optionality', () => {
    // Optional intersected with compatible type should preserve optional semantics
    const optionalSchema = z.string().optional()
    const stringSchema = z.string().min(5)

    const intersectionSchema = z.intersection(optionalSchema, stringSchema)
    const result = fake(intersectionSchema)

    // Result should be either undefined or a string with min length 5
    if (result !== undefined) {
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThanOrEqual(5)
    }
  })

  it('should handle optional with literal by checking compatibility', () => {
    // Optional intersected with literal should work if literal is compatible
    const optionalSchema = z.string().optional()
    const stringLiteral = z.literal('hello')

    const intersectionSchema = z.intersection(optionalSchema, stringLiteral)
    const result = fake(intersectionSchema)

    // Result should be either undefined or 'hello'
    if (result !== undefined) {
      expect(result).toBe('hello')
    }
  })

  it('should handle optional with another optional by merging constraints', () => {
    // Optional intersected with another optional should merge underlying types
    const optional1 = z.string().min(3).optional()
    const optional2 = z.string().max(10).optional()

    const intersectionSchema = z.intersection(optional1, optional2)
    const result = fake(intersectionSchema)

    // Result should be either undefined or a string with merged constraints
    if (result !== undefined) {
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThanOrEqual(3)
      expect(result.length).toBeLessThanOrEqual(10)
    }
  })

  it('should throw error for optional with incompatible type', () => {
    // Optional with incompatible underlying type should throw error
    const optionalSchema = z.string().optional()
    const numberSchema = z.number()

    const intersectionSchema = z.intersection(optionalSchema, numberSchema)

    expect(() => fake(intersectionSchema)).toThrow(/Cannot intersect (string with number|number with string)/)
  })

  it('should handle optional with any/unknown types', () => {
    // Optional should work with any/unknown by preserving optionality
    const optionalSchema = z.number().optional()
    const anySchema = z.any()
    const unknownSchema = z.unknown()

    const optionalAnyIntersection = z.intersection(optionalSchema, anySchema)
    const optionalUnknownIntersection = z.intersection(optionalSchema, unknownSchema)

    const anyResult = fake(optionalAnyIntersection)
    const unknownResult = fake(optionalUnknownIntersection)

    // Results should be either undefined or numbers
    if (anyResult !== undefined) {
      expect(typeof anyResult).toBe('number')
    }
    if (unknownResult !== undefined) {
      expect(typeof unknownResult).toBe('number')
    }
  })

  it('should handle optional with object types by merging shapes', () => {
    // Optional object intersected with another object should merge shapes
    const optionalSchema = z.object({ name: z.string() }).optional()
    const objectSchema = z.object({ age: z.number() })

    const intersectionSchema = z.intersection(optionalSchema, objectSchema)
    const result = fake(intersectionSchema)

    // Result should be either undefined or an object with both properties
    if (result !== undefined) {
      expect(typeof result).toBe('object')
      expect(result).not.toBeNull()
      expect(typeof (result as any).name).toBe('string')
      expect(typeof (result as any).age).toBe('number')
    }
  })

  it('should handle optional with array types by merging constraints', () => {
    // Optional array intersected with another array should merge constraints
    const optionalSchema = z.array(z.string()).optional()
    const arraySchema = z.array(z.string().min(2))

    const intersectionSchema = z.intersection(optionalSchema, arraySchema)
    const result = fake(intersectionSchema)

    // Result should be either undefined or an array with merged constraints
    if (result !== undefined) {
      expect(Array.isArray(result)).toBe(true)
      result.forEach((item: any) => {
        expect(typeof item).toBe('string')
        expect(item.length).toBeGreaterThanOrEqual(2)
      })
    }
  })

  it('should handle optional with union types by filtering compatible options', () => {
    // Optional intersected with union should filter union to compatible options
    const optionalSchema = z.string().optional()
    const unionSchema = z.union([z.string(), z.number()])

    const intersectionSchema = z.intersection(optionalSchema, unionSchema)
    const result = fake(intersectionSchema)

    // Result should be either undefined or a string
    if (result !== undefined) {
      expect(typeof result).toBe('string')
    }
  })

  it('should handle complex nested optional intersections', () => {
    // Test complex nested optional structures
    const optionalSchema = z.object({
      data: z.array(z.object({ id: z.string() }))
    }).optional()

    const constraintSchema = z.object({
      data: z.array(z.object({ id: z.string().min(5) }))
    })

    const intersectionSchema = z.intersection(optionalSchema, constraintSchema)
    const result = fake(intersectionSchema)

    // Result should be either undefined or an object with merged constraints
    if (result !== undefined) {
      expect(typeof result).toBe('object')
      expect(result).not.toBeNull()
      expect(Array.isArray((result as any).data)).toBe(true)
      ;(result as any).data.forEach((item: any) => {
        expect(typeof item.id).toBe('string')
        expect(item.id.length).toBeGreaterThanOrEqual(5)
      })
    }
  })
})

describe('set intersection handler', () => {
  it('should handle identical set schemas by returning a valid set', () => {
    const set1 = z.set(z.string())
    const set2 = z.set(z.string())

    const intersectionSchema = z.intersection(set1, set2)
    const result = fake(intersectionSchema)

    expect(result instanceof Set).toBe(true)
    result.forEach(value => {
      expect(typeof value).toBe('string')
    })
  })

  it('should handle set element type intersections', () => {
    const set1 = z.set(z.string().min(3))
    const set2 = z.set(z.string().max(10))

    const intersectionSchema = z.intersection(set1, set2)
    const result = fake(intersectionSchema)

    expect(result instanceof Set).toBe(true)
    result.forEach(value => {
      expect(typeof value).toBe('string')
      expect(value.length).toBeGreaterThanOrEqual(3)
      expect(value.length).toBeLessThanOrEqual(10)
    })
  })

  it('should handle set size constraints by merging them', () => {
    const set1 = z.set(z.string()).min(2).max(5)
    const set2 = z.set(z.string()).min(3).max(4)

    const intersectionSchema = z.intersection(set1, set2)
    const result = fake(intersectionSchema)

    expect(result instanceof Set).toBe(true)
    expect(result.size).toBeGreaterThanOrEqual(3)
    expect(result.size).toBeLessThanOrEqual(4)
    result.forEach(value => {
      expect(typeof value).toBe('string')
    })
  })

  it('should throw error for conflicting size constraints', () => {
    const set1 = z.set(z.string()).min(5).max(10)
    const set2 = z.set(z.string()).min(15).max(20)

    expect(() => {
      const intersectionSchema = z.intersection(set1, set2)
      fake(intersectionSchema)
    }).toThrow('Cannot intersect set constraints')
  })

  it('should throw error for incompatible element types', () => {
    const set1 = z.set(z.string())
    const set2 = z.set(z.number())

    expect(() => {
      const intersectionSchema = z.intersection(set1, set2)
      fake(intersectionSchema)
    }).toThrow()
  })

  it('should handle set with any/unknown element types', () => {
    const set1 = z.set(z.string())
    const set2 = z.set(z.any())

    const intersectionSchema = z.intersection(set1, set2)
    const result = fake(intersectionSchema)

    expect(result instanceof Set).toBe(true)
    result.forEach(value => {
      expect(typeof value).toBe('string')
    })
  })

  it('should throw error for set with incompatible type', () => {
    const set1 = z.set(z.string())
    const array1 = z.array(z.string())

    expect(() => {
      const intersectionSchema = z.intersection(set1, array1)
      fake(intersectionSchema)
    }).toThrow('Cannot intersect set with array')
  })

  it('should handle nested set intersections', () => {
    const set1 = z.set(z.set(z.string()))
    const set2 = z.set(z.set(z.string().min(2)))

    const intersectionSchema = z.intersection(set1, set2)
    const result = fake(intersectionSchema)

    expect(result instanceof Set).toBe(true)
    result.forEach(value => {
      expect(value instanceof Set).toBe(true)
      value.forEach(nestedValue => {
        expect(typeof nestedValue).toBe('string')
        expect(nestedValue.length).toBeGreaterThanOrEqual(2)
      })
    })
  })

  it('should handle empty set constraints', () => {
    const set1 = z.set(z.string()).size(0)
    const set2 = z.set(z.string()).max(0)

    const intersectionSchema = z.intersection(set1, set2)
    const result = fake(intersectionSchema)

    expect(result instanceof Set).toBe(true)
    expect(result.size).toBe(0)
  })
})
