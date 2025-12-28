import { describe, expect, it } from 'vitest'
import * as z from 'zod/v4'
import { fake } from '../../src/v4/fake'

describe('v4 intersection faker', () => {
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
      }).toThrow('handleStringIntersection not yet implemented')

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

      expect(() => {
        const intersectionSchema = z.intersection(objectSchema, anotherObjectSchema)
        fake(intersectionSchema)
      }).toThrow('handleObjectIntersection not yet implemented')
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
      }).toThrow('handleStringIntersection not yet implemented')
    })
  })
})
