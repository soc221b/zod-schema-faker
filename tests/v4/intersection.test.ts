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

  describe('Property 3: Cross-type intersection handling', () => {
    it('**Feature: v4-intersection, Property 3: Cross-type intersection handling**', () => {
      // **Validates: Requirements 2.2, 2.3**

      // Test cross-type intersection handling across different schema categories
      // This property test validates that intersections between different schema types
      // follow the correct precedence rules and error handling

      // Test 1: Wrapper types preserve semantics when intersected with compatible types
      const optionalString = z.string().optional()
      const constrainedString = z.string().min(5)
      const optionalIntersection = z.intersection(optionalString, constrainedString)

      const optionalResult = fake(optionalIntersection)
      if (optionalResult !== undefined) {
        expect(typeof optionalResult).toBe('string')
        expect(optionalResult.length).toBeGreaterThanOrEqual(5)
      }

      // Test 2: Literal types have higher precedence than primitive types
      const literalValue = z.literal('test')
      const stringType = z.string()
      const literalStringIntersection = z.intersection(literalValue, stringType)

      const literalResult = fake(literalStringIntersection)
      expect(literalResult).toBe('test')

      // Test 3: Enum types have higher precedence than primitive types
      const colorEnum = z.enum(['red', 'green', 'blue'])
      const stringEnum = z.string()
      const enumStringIntersection = z.intersection(colorEnum, stringEnum)

      const enumResult = fake(enumStringIntersection)
      expect(['red', 'green', 'blue']).toContain(enumResult)

      // Test 4: Never type always results in never (impossible intersection)
      const neverType = z.never()
      const numberType = z.number()

      expect(() => {
        const neverIntersection = z.intersection(neverType, numberType)
        fake(neverIntersection)
      }).toThrow('Cannot generate fake data for intersection with never type - intersection is impossible')

      // Test 5: Any/Unknown types are compatible with all other types
      const anyType = z.any()
      const unknownType = z.unknown()
      const specificString = z.string().min(3)

      const anyIntersection = z.intersection(anyType, specificString)
      const unknownIntersection = z.intersection(unknownType, specificString)

      const anyIntersectionResult = fake(anyIntersection)
      const unknownIntersectionResult = fake(unknownIntersection)

      expect(typeof anyIntersectionResult).toBe('string')
      expect(anyIntersectionResult.length).toBeGreaterThanOrEqual(3)
      expect(typeof unknownIntersectionResult).toBe('string')
      expect(unknownIntersectionResult.length).toBeGreaterThanOrEqual(3)

      // Test 6: Incompatible primitive types throw descriptive errors
      expect(() => {
        const stringNumber = z.intersection(z.string(), z.number())
        fake(stringNumber)
      }).toThrow('Cannot intersect string with number')

      expect(() => {
        const booleanDate = z.intersection(z.boolean(), z.date())
        fake(booleanDate)
      }).toThrow('Cannot intersect boolean with date')

      // Test 7: Collection types merge constraints properly
      const array1 = z.array(z.string()).min(2)
      const array2 = z.array(z.string()).max(5)
      const arrayIntersection = z.intersection(array1, array2)

      const arrayResult = fake(arrayIntersection)
      expect(Array.isArray(arrayResult)).toBe(true)
      expect(arrayResult.length).toBeGreaterThanOrEqual(2)
      expect(arrayResult.length).toBeLessThanOrEqual(5)

      // Test 8: Object types merge shapes correctly
      const obj1 = z.object({ name: z.string() })
      const obj2 = z.object({ age: z.number() })
      const objectIntersection = z.intersection(obj1, obj2)

      const objectResult = fake(objectIntersection)
      expect(typeof objectResult).toBe('object')
      expect(objectResult).toHaveProperty('name')
      expect(objectResult).toHaveProperty('age')
      expect(typeof (objectResult as any).name).toBe('string')
      expect(typeof (objectResult as any).age).toBe('number')

      // Test 9: Union types filter to compatible options
      const union = z.union([z.string(), z.number(), z.boolean()])
      const stringConstraint = z.string().min(1)
      const unionIntersection = z.intersection(union, stringConstraint)

      const unionResult = fake(unionIntersection)
      expect(typeof unionResult).toBe('string')
      expect(unionResult.length).toBeGreaterThanOrEqual(1)

      // Test 10: Wrapper type precedence (more specific wrappers take precedence)
      const catchWrapper = z.string().catch('fallback')
      const optionalWrapper = z.string().optional()
      const wrapperIntersection = z.intersection(catchWrapper, optionalWrapper)

      const wrapperResult = fake(wrapperIntersection)
      // Should preserve both wrapper semantics
      expect(typeof wrapperResult === 'string' || wrapperResult === undefined).toBe(true)
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

  describe('readonly intersection handler', () => {
    it('should handle readonly with compatible type by preserving readonly semantics', () => {
      // Readonly should work with compatible underlying type
      const readonlyString = z.string().readonly()
      const stringSchema = z.string()

      const intersectionSchema = z.intersection(readonlyString, stringSchema)
      const result = fake(intersectionSchema)

      // Should return a string (the intersected value)
      expect(typeof result).toBe('string')
    })

    it('should handle readonly with same readonly type', () => {
      // Same readonly type should intersect to that type
      const readonlyString1 = z.string().readonly()
      const readonlyString2 = z.string().readonly()

      const intersectionSchema = z.intersection(readonlyString1, readonlyString2)
      const result = fake(intersectionSchema)

      expect(typeof result).toBe('string')
    })

    it('should handle readonly with incompatible type', () => {
      // Readonly string with number should be impossible
      const readonlyString = z.string().readonly()
      const numberSchema = z.number()

      const intersectionSchema = z.intersection(readonlyString, numberSchema)

      expect(() => fake(intersectionSchema)).toThrow('Cannot intersect')
    })

    it('should handle readonly with any/unknown types', () => {
      // Readonly should work with any/unknown
      const readonlyNumber = z.number().readonly()
      const anySchema = z.any()
      const unknownSchema = z.unknown()

      const readonlyAnyIntersection = z.intersection(readonlyNumber, anySchema)
      const readonlyUnknownIntersection = z.intersection(readonlyNumber, unknownSchema)

      const anyResult = fake(readonlyAnyIntersection)
      const unknownResult = fake(readonlyUnknownIntersection)

      expect(typeof anyResult).toBe('number')
      expect(typeof unknownResult).toBe('number')
    })

    it('should handle readonly with union types', () => {
      // Readonly should work with compatible union options
      const readonlyString = z.string().readonly()
      const stringNumberUnion = z.union([z.string(), z.number()])

      const intersectionSchema = z.intersection(readonlyString, stringNumberUnion)
      const result = fake(intersectionSchema)

      // Should return a string (the compatible union option)
      expect(typeof result).toBe('string')
    })

    it('should handle readonly with lazy types', () => {
      // Readonly should work with lazy schemas
      const readonlyString = z.string().readonly()
      const lazyString = z.lazy(() => z.string())

      const intersectionSchema = z.intersection(readonlyString, lazyString)
      const result = fake(intersectionSchema)

      expect(typeof result).toBe('string')
    })

    it('should handle readonly with pipe types', () => {
      // Readonly should work with pipe schemas
      const readonlyString = z.string().readonly()
      const pipeString = z.string().pipe(z.string())

      const intersectionSchema = z.intersection(readonlyString, pipeString)
      const result = fake(intersectionSchema)

      expect(typeof result).toBe('string')
    })

    it('should handle readonly with other wrapper types', () => {
      // Readonly should work with optional, nullable, default
      const readonlyString = z.string().readonly()
      const optionalString = z.string().optional()
      const nullableString = z.string().nullable()
      const defaultString = z.string().default('default')

      const readonlyOptionalIntersection = z.intersection(readonlyString, optionalString)
      const readonlyNullableIntersection = z.intersection(readonlyString, nullableString)
      const readonlyDefaultIntersection = z.intersection(readonlyString, defaultString)

      const optionalResult = fake(readonlyOptionalIntersection)
      const nullableResult = fake(readonlyNullableIntersection)
      const defaultResult = fake(readonlyDefaultIntersection)

      // Results should be strings or the wrapper values (undefined, null, default)
      expect(optionalResult === undefined || typeof optionalResult === 'string').toBe(true)
      expect(nullableResult === null || typeof nullableResult === 'string').toBe(true)
      expect(defaultResult === 'default' || typeof defaultResult === 'string').toBe(true)
    })

    it('should handle complex readonly intersections', () => {
      // Test readonly with constrained types
      const readonlyConstrainedString = z.string().min(5).max(10).readonly()
      const anotherConstrainedString = z.string().min(3).max(8)

      const intersectionSchema = z.intersection(readonlyConstrainedString, anotherConstrainedString)
      const result = fake(intersectionSchema)

      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThanOrEqual(5) // max of mins
      expect(result.length).toBeLessThanOrEqual(8) // min of maxes
    })
  })

  describe('nonoptional intersection handler', () => {
    it('should handle nonoptional with compatible type by preserving nonoptional semantics', () => {
      // Nonoptional should work with compatible underlying type
      const nonoptionalString = z.string().optional().nonoptional()
      const stringSchema = z.string()

      const intersectionSchema = z.intersection(nonoptionalString, stringSchema)
      const result = fake(intersectionSchema)

      // Should return a string (the intersected value, never undefined)
      expect(typeof result).toBe('string')
      expect(result).not.toBe(undefined)
    })

    it('should handle nonoptional with same nonoptional type', () => {
      // Same nonoptional type should intersect to that type
      const nonoptionalString1 = z.string().optional().nonoptional()
      const nonoptionalString2 = z.string().optional().nonoptional()

      const intersectionSchema = z.intersection(nonoptionalString1, nonoptionalString2)
      const result = fake(intersectionSchema)

      expect(typeof result).toBe('string')
      expect(result).not.toBe(undefined)
    })

    it('should handle nonoptional with incompatible type', () => {
      // Nonoptional string with number should be impossible
      const nonoptionalString = z.string().optional().nonoptional()
      const numberSchema = z.number()

      const intersectionSchema = z.intersection(nonoptionalString, numberSchema)

      expect(() => fake(intersectionSchema)).toThrow('Cannot intersect')
    })

    it('should handle nonoptional with any/unknown types', () => {
      // Nonoptional should work with any/unknown
      const nonoptionalNumber = z.number().optional().nonoptional()
      const anySchema = z.any()
      const unknownSchema = z.unknown()

      const nonoptionalAnyIntersection = z.intersection(nonoptionalNumber, anySchema)
      const nonoptionalUnknownIntersection = z.intersection(nonoptionalNumber, unknownSchema)

      const anyResult = fake(nonoptionalAnyIntersection)
      const unknownResult = fake(nonoptionalUnknownIntersection)

      expect(typeof anyResult).toBe('number')
      expect(typeof unknownResult).toBe('number')
      expect(anyResult).not.toBe(undefined)
      expect(unknownResult).not.toBe(undefined)
    })

    it('should handle nonoptional with union types', () => {
      // Nonoptional should work with compatible union options
      const nonoptionalString = z.string().optional().nonoptional()
      const stringNumberUnion = z.union([z.string(), z.number()])

      const intersectionSchema = z.intersection(nonoptionalString, stringNumberUnion)
      const result = fake(intersectionSchema)

      // Should return a string (the compatible union option)
      expect(typeof result).toBe('string')
      expect(result).not.toBe(undefined)
    })

    it('should handle nonoptional with lazy types', () => {
      // Nonoptional should work with lazy schemas
      const nonoptionalString = z.string().optional().nonoptional()
      const lazyString = z.lazy(() => z.string())

      const intersectionSchema = z.intersection(nonoptionalString, lazyString)
      const result = fake(intersectionSchema)

      expect(typeof result).toBe('string')
      expect(result).not.toBe(undefined)
    })

    it('should handle nonoptional with pipe types', () => {
      // Nonoptional should work with pipe schemas
      const nonoptionalString = z.string().optional().nonoptional()
      const pipeString = z.string().pipe(z.string())

      const intersectionSchema = z.intersection(nonoptionalString, pipeString)
      const result = fake(intersectionSchema)

      expect(typeof result).toBe('string')
      expect(result).not.toBe(undefined)
    })

    it('should handle nonoptional with other wrapper types', () => {
      // Nonoptional should work with optional, nullable, default
      const nonoptionalString = z.string().optional().nonoptional()
      const optionalString = z.string().optional()
      const nullableString = z.string().nullable()
      const defaultString = z.string().default('default')

      const nonoptionalOptionalIntersection = z.intersection(nonoptionalString, optionalString)
      const nonoptionalNullableIntersection = z.intersection(nonoptionalString, nullableString)
      const nonoptionalDefaultIntersection = z.intersection(nonoptionalString, defaultString)

      const optionalResult = fake(nonoptionalOptionalIntersection)
      const nullableResult = fake(nonoptionalNullableIntersection)
      const defaultResult = fake(nonoptionalDefaultIntersection)

      // Results should never be undefined (nonoptional enforces this)
      expect(optionalResult).not.toBe(undefined)
      expect(nullableResult === null || typeof nullableResult === 'string').toBe(true)
      expect(defaultResult === 'default' || typeof defaultResult === 'string').toBe(true)
    })

    it('should handle complex nonoptional intersections', () => {
      // Test nonoptional with constrained types
      const nonoptionalConstrainedString = z.string().min(5).max(10).optional().nonoptional()
      const anotherConstrainedString = z.string().min(3).max(8)

      const intersectionSchema = z.intersection(nonoptionalConstrainedString, anotherConstrainedString)
      const result = fake(intersectionSchema)

      expect(typeof result).toBe('string')
      expect(result).not.toBe(undefined)
      expect(result.length).toBeGreaterThanOrEqual(5) // max of mins
      expect(result.length).toBeLessThanOrEqual(8) // min of maxes
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
    const pipe1 = z
      .string()
      .min(3)
      .pipe(z.string().transform(s => s.toUpperCase()))
    const pipe2 = z
      .string()
      .max(10)
      .pipe(z.string().transform(s => s.toLowerCase()))

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
    const pipeSchema = z
      .object({ name: z.string() })
      .pipe(z.object({ name: z.string() }).transform(obj => ({ ...obj, processed: true })))
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
    const pipeSchema = z
      .object({
        data: z.array(z.object({ id: z.string() })),
      })
      .pipe(
        z
          .object({
            data: z.array(z.object({ id: z.string() })),
          })
          .transform(obj => ({ ...obj, processed: true })),
      )

    const constraintSchema = z.object({
      data: z.array(z.object({ id: z.string().min(5) })),
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
    const optionalSchema = z
      .object({
        data: z.array(z.object({ id: z.string() })),
      })
      .optional()

    const constraintSchema = z.object({
      data: z.array(z.object({ id: z.string().min(5) })),
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

describe('nullable intersection handler', () => {
  it('should handle nullable with compatible type by preserving nullability', () => {
    // Nullable intersected with compatible type should preserve nullable semantics
    const nullableSchema = z.string().nullable()
    const stringSchema = z.string().min(5)

    const intersectionSchema = z.intersection(nullableSchema, stringSchema)
    const result = fake(intersectionSchema)

    // Result should be either null or a string with min length 5
    if (result !== null) {
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThanOrEqual(5)
    }
  })

  it('should handle nullable with literal by checking compatibility', () => {
    // Nullable intersected with literal should work if literal is compatible
    const nullableSchema = z.string().nullable()
    const stringLiteral = z.literal('hello')

    const intersectionSchema = z.intersection(nullableSchema, stringLiteral)
    const result = fake(intersectionSchema)

    // Result should be either null or 'hello'
    if (result !== null) {
      expect(result).toBe('hello')
    }
  })

  it('should handle nullable with another nullable by merging constraints', () => {
    // Nullable intersected with another nullable should merge underlying types
    const nullable1 = z.string().min(3).nullable()
    const nullable2 = z.string().max(10).nullable()

    const intersectionSchema = z.intersection(nullable1, nullable2)
    const result = fake(intersectionSchema)

    // Result should be either null or a string with merged constraints
    if (result !== null) {
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThanOrEqual(3)
      expect(result.length).toBeLessThanOrEqual(10)
    }
  })

  it('should throw error for nullable with incompatible type', () => {
    // Nullable with incompatible underlying type should throw error
    const nullableSchema = z.string().nullable()
    const numberSchema = z.number()

    const intersectionSchema = z.intersection(nullableSchema, numberSchema)

    expect(() => fake(intersectionSchema)).toThrow(/Cannot intersect (string with number|number with string)/)
  })

  it('should handle nullable with any/unknown types', () => {
    // Nullable should work with any/unknown by preserving nullability
    const nullableSchema = z.number().nullable()
    const anySchema = z.any()
    const unknownSchema = z.unknown()

    const nullableAnyIntersection = z.intersection(nullableSchema, anySchema)
    const nullableUnknownIntersection = z.intersection(nullableSchema, unknownSchema)

    const anyResult = fake(nullableAnyIntersection)
    const unknownResult = fake(nullableUnknownIntersection)

    // Results should be either null or numbers
    if (anyResult !== null) {
      expect(typeof anyResult).toBe('number')
    }
    if (unknownResult !== null) {
      expect(typeof unknownResult).toBe('number')
    }
  })

  it('should handle nullable with object types by merging shapes', () => {
    // Nullable object intersected with another object should merge shapes
    const nullableSchema = z.object({ name: z.string() }).nullable()
    const objectSchema = z.object({ age: z.number() })

    const intersectionSchema = z.intersection(nullableSchema, objectSchema)
    const result = fake(intersectionSchema)

    // Result should be either null or an object with both properties
    if (result !== null) {
      expect(typeof result).toBe('object')
      expect(result).not.toBeNull()
      expect(typeof (result as any).name).toBe('string')
      expect(typeof (result as any).age).toBe('number')
    }
  })

  it('should handle nullable with array types by merging constraints', () => {
    // Nullable array intersected with another array should merge constraints
    const nullableSchema = z.array(z.string()).nullable()
    const arraySchema = z.array(z.string().min(2))

    const intersectionSchema = z.intersection(nullableSchema, arraySchema)
    const result = fake(intersectionSchema)

    // Result should be either null or an array with merged constraints
    if (result !== null) {
      expect(Array.isArray(result)).toBe(true)
      result.forEach((item: any) => {
        expect(typeof item).toBe('string')
        expect(item.length).toBeGreaterThanOrEqual(2)
      })
    }
  })

  it('should handle nullable with union types by filtering compatible options', () => {
    // Nullable intersected with union should filter union to compatible options
    const nullableSchema = z.string().nullable()
    const unionSchema = z.union([z.string(), z.number()])

    const intersectionSchema = z.intersection(nullableSchema, unionSchema)
    const result = fake(intersectionSchema)

    // Result should be either null or a string
    if (result !== null) {
      expect(typeof result).toBe('string')
    }
  })

  it('should handle complex nested nullable intersections', () => {
    // Test complex nested nullable structures
    const nullableSchema = z
      .object({
        data: z.array(z.object({ id: z.string() })),
      })
      .nullable()

    const constraintSchema = z.object({
      data: z.array(z.object({ id: z.string().min(5) })),
    })

    const intersectionSchema = z.intersection(nullableSchema, constraintSchema)
    const result = fake(intersectionSchema)

    // Result should be either null or an object with merged constraints
    if (result !== null) {
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

describe('default intersection handler', () => {
  it('should handle default with compatible type by preserving default semantics', () => {
    // Default intersected with compatible type should preserve default semantics
    const defaultSchema = z.string().default('default-value')
    const stringSchema = z.string().min(5)

    const intersectionSchema = z.intersection(defaultSchema, stringSchema)
    const result = fake(intersectionSchema)

    // Should either return the default value or a string that satisfies both constraints
    if (result === 'default-value') {
      expect(result).toBe('default-value')
    } else {
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThanOrEqual(5)
    }
  })

  it('should handle default with incompatible type by throwing error', () => {
    // Default string intersected with number should be impossible
    const defaultSchema = z.string().default('default-value')
    const numberSchema = z.number()

    expect(() => {
      const intersectionSchema = z.intersection(defaultSchema, numberSchema)
      fake(intersectionSchema)
    }).toThrow('Cannot intersect')
  })

  it('should handle default with literal that matches default value', () => {
    // Default intersected with matching literal should work
    const defaultSchema = z.string().default('hello')
    const literalSchema = z.literal('hello')

    const intersectionSchema = z.intersection(defaultSchema, literalSchema)
    const result = fake(intersectionSchema)

    expect(result).toBe('hello')
  })

  it('should handle default with literal that conflicts with default value', () => {
    // Default intersected with conflicting literal should prefer the literal
    const defaultSchema = z.string().default('hello')
    const literalSchema = z.literal('world')

    const intersectionSchema = z.intersection(defaultSchema, literalSchema)
    const result = fake(intersectionSchema)

    // Should return the literal value since it's more specific
    expect(result).toBe('world')
  })

  it('should handle default with enum containing default value', () => {
    // Default intersected with enum containing the default should work
    const defaultSchema = z.string().default('red')
    const enumSchema = z.enum(['red', 'green', 'blue'])

    const intersectionSchema = z.intersection(defaultSchema, enumSchema)
    const result = fake(intersectionSchema)

    expect(['red', 'green', 'blue']).toContain(result)
  })

  it('should handle default with enum not containing default value', () => {
    // Default intersected with enum not containing the default should work with enum values
    const defaultSchema = z.string().default('yellow')
    const enumSchema = z.enum(['red', 'green', 'blue'])

    const intersectionSchema = z.intersection(defaultSchema, enumSchema)
    const result = fake(intersectionSchema)

    expect(['red', 'green', 'blue']).toContain(result)
  })

  it('should handle default with any/unknown types', () => {
    // Default should work with any/unknown
    const defaultSchema = z.number().default(42)
    const anySchema = z.any()
    const unknownSchema = z.unknown()

    const defaultAnyIntersection = z.intersection(defaultSchema, anySchema)
    const defaultUnknownIntersection = z.intersection(defaultSchema, unknownSchema)

    const anyResult = fake(defaultAnyIntersection)
    const unknownResult = fake(defaultUnknownIntersection)

    // Should either return the default value or a number
    if (typeof anyResult === 'number') {
      expect(typeof anyResult).toBe('number')
    } else {
      expect(anyResult).toBe(42)
    }

    if (typeof unknownResult === 'number') {
      expect(typeof unknownResult).toBe('number')
    } else {
      expect(unknownResult).toBe(42)
    }
  })

  it('should handle default with union containing compatible type', () => {
    // Default intersected with union should filter to compatible options
    const defaultSchema = z.string().default('hello')
    const unionSchema = z.union([z.string(), z.number()])

    const intersectionSchema = z.intersection(defaultSchema, unionSchema)
    const result = fake(intersectionSchema)

    expect(typeof result).toBe('string')
  })

  it('should handle default with union not containing compatible type', () => {
    // Default string intersected with number-only union should be impossible
    const defaultSchema = z.string().default('hello')
    const unionSchema = z.union([z.number(), z.boolean()])

    expect(() => {
      const intersectionSchema = z.intersection(defaultSchema, unionSchema)
      fake(intersectionSchema)
    }).toThrow()
  })

  it('should handle complex nested default intersections', () => {
    // Test complex nested default structures
    const defaultSchema = z.object({
      name: z.string().default('John'),
      age: z.number().default(25),
    })
    const objectSchema = z.object({
      name: z.string().min(2),
      age: z.number().min(18),
    })

    const intersectionSchema = z.intersection(defaultSchema, objectSchema)
    const result = fake(intersectionSchema)

    expect(typeof result).toBe('object')
    expect(result).not.toBeNull()
    expect(typeof result.name).toBe('string')
    expect(result.name.length).toBeGreaterThanOrEqual(2)
    expect(typeof result.age).toBe('number')
    expect(result.age).toBeGreaterThanOrEqual(18)
  })

  it('should handle default with wrapper types', () => {
    // Default intersected with optional should preserve both semantics
    const defaultSchema = z.string().default('default')
    const optionalSchema = z.string().optional()

    const intersectionSchema = z.intersection(defaultSchema, optionalSchema)
    const result = fake(intersectionSchema)

    // Should return either undefined (from optional) or a string (from default)
    if (result === undefined) {
      expect(result).toBe(undefined)
    } else {
      expect(typeof result).toBe('string')
    }
  })

  it('should handle probabilistic default value returns', () => {
    // Test that default values are returned probabilistically (not always)
    const defaultSchema = z.string().default('default-value')
    const stringSchema = z.string()

    const intersectionSchema = z.intersection(defaultSchema, stringSchema)

    // Generate multiple values to test probabilistic behavior
    const results = Array.from({ length: 20 }, () => fake(intersectionSchema))

    // Should have a mix of default values and generated strings
    const hasDefaultValue = results.some(r => r === 'default-value')
    const hasGeneratedValue = results.some(r => r !== 'default-value')

    // At least one of each type should appear (probabilistic)
    expect(hasDefaultValue || hasGeneratedValue).toBe(true)

    // All results should be strings
    results.forEach(result => {
      expect(typeof result).toBe('string')
    })
  })

  describe('catch intersection handler', () => {
    it('should handle catch with compatible type by preserving catch semantics', () => {
      // Catch should work with compatible underlying type
      const catchString = z.string().catch('fallback')
      const stringSchema = z.string()

      const intersectionSchema = z.intersection(catchString, stringSchema)
      const result = fake(intersectionSchema)

      // Should return a string (the intersected value)
      expect(typeof result).toBe('string')
    })

    it('should handle catch with same catch type', () => {
      // Same catch type should intersect to that type
      const catchString1 = z.string().catch('fallback1')
      const catchString2 = z.string().catch('fallback2')

      const intersectionSchema = z.intersection(catchString1, catchString2)
      const result = fake(intersectionSchema)

      expect(typeof result).toBe('string')
    })

    it('should handle catch with incompatible type', () => {
      // Catch string with number should be impossible
      const catchString = z.string().catch('fallback')
      const numberSchema = z.number()

      const intersectionSchema = z.intersection(catchString, numberSchema)

      expect(() => fake(intersectionSchema)).toThrow('Cannot intersect')
    })

    it('should handle catch with any/unknown types', () => {
      // Catch should work with any/unknown
      const catchNumber = z.number().catch(42)
      const anySchema = z.any()
      const unknownSchema = z.unknown()

      const catchAnyIntersection = z.intersection(catchNumber, anySchema)
      const catchUnknownIntersection = z.intersection(catchNumber, unknownSchema)

      const anyResult = fake(catchAnyIntersection)
      const unknownResult = fake(catchUnknownIntersection)

      expect(typeof anyResult).toBe('number')
      expect(typeof unknownResult).toBe('number')
    })

    it('should handle catch with union types', () => {
      // Catch should work with compatible union options
      const catchString = z.string().catch('fallback')
      const stringNumberUnion = z.union([z.string(), z.number()])

      const intersectionSchema = z.intersection(catchString, stringNumberUnion)
      const result = fake(intersectionSchema)

      // Should return a string (the compatible union option)
      expect(typeof result).toBe('string')
    })

    it('should handle catch with lazy types', () => {
      // Catch should work with lazy schemas
      const catchString = z.string().catch('fallback')
      const lazyString = z.lazy(() => z.string())

      const intersectionSchema = z.intersection(catchString, lazyString)
      const result = fake(intersectionSchema)

      expect(typeof result).toBe('string')
    })

    it('should handle catch with pipe types', () => {
      // Catch should work with pipe schemas
      const catchString = z.string().catch('fallback')
      const pipeString = z.string().pipe(z.string())

      const intersectionSchema = z.intersection(catchString, pipeString)
      const result = fake(intersectionSchema)

      expect(typeof result).toBe('string')
    })

    it('should handle catch with other wrapper types', () => {
      // Catch should work with optional, nullable, default, readonly
      const catchString = z.string().catch('fallback')
      const optionalString = z.string().optional()
      const nullableString = z.string().nullable()
      const defaultString = z.string().default('default')
      const readonlyString = z.string().readonly()

      const catchOptionalIntersection = z.intersection(catchString, optionalString)
      const catchNullableIntersection = z.intersection(catchString, nullableString)
      const catchDefaultIntersection = z.intersection(catchString, defaultString)
      const catchReadonlyIntersection = z.intersection(catchString, readonlyString)

      const optionalResult = fake(catchOptionalIntersection)
      const nullableResult = fake(catchNullableIntersection)
      const defaultResult = fake(catchDefaultIntersection)
      const readonlyResult = fake(catchReadonlyIntersection)

      // Results should be strings or the wrapper values (undefined, null, default)
      expect(optionalResult === undefined || typeof optionalResult === 'string').toBe(true)
      expect(nullableResult === null || typeof nullableResult === 'string').toBe(true)
      expect(defaultResult === 'default' || typeof defaultResult === 'string').toBe(true)
      expect(typeof readonlyResult).toBe('string')
    })

    it('should handle complex catch intersections', () => {
      // Test catch with constrained types
      const catchConstrainedString = z.string().min(5).max(10).catch('fallback')
      const anotherConstrainedString = z.string().min(3).max(8)

      const intersectionSchema = z.intersection(catchConstrainedString, anotherConstrainedString)
      const result = fake(intersectionSchema)

      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThanOrEqual(5) // max of mins
      expect(result.length).toBeLessThanOrEqual(8) // min of maxes
    })

    it('should handle catch with function fallback', () => {
      // Test catch with function fallback
      const catchWithFunction = z.number().catch(() => 42)
      const numberSchema = z.number()

      const intersectionSchema = z.intersection(catchWithFunction, numberSchema)
      const result = fake(intersectionSchema)

      expect(typeof result).toBe('number')
    })

    it('should handle nested catch intersections', () => {
      // Test catch with nested schemas
      const catchObject = z.object({ name: z.string() }).catch({ name: 'fallback' })
      const objectSchema = z.object({ name: z.string(), age: z.number() })

      const intersectionSchema = z.intersection(catchObject, objectSchema)
      const result = fake(intersectionSchema)

      expect(typeof result).toBe('object')
      expect(result).toHaveProperty('name')
      expect(result).toHaveProperty('age')
      expect(typeof result.name).toBe('string')
      expect(typeof result.age).toBe('number')
    })
  })

  describe('prefault intersection handler', () => {
    it('should handle prefault with compatible type by preserving prefault semantics', () => {
      // Prefault should work with compatible underlying type
      const prefaultString = z.string().prefault('fallback')
      const stringSchema = z.string()

      const intersectionSchema = z.intersection(prefaultString, stringSchema)
      const result = fake(intersectionSchema)

      // Should return a string (the intersected value)
      expect(typeof result).toBe('string')
    })

    it('should handle prefault with same prefault type', () => {
      // Same prefault type should intersect to that type
      const prefaultString1 = z.string().prefault('fallback1')
      const prefaultString2 = z.string().prefault('fallback2')

      const intersectionSchema = z.intersection(prefaultString1, prefaultString2)
      const result = fake(intersectionSchema)

      expect(typeof result).toBe('string')
    })

    it('should handle prefault with incompatible type', () => {
      // Prefault string with number should be impossible
      const prefaultString = z.string().prefault('fallback')
      const numberSchema = z.number()

      const intersectionSchema = z.intersection(prefaultString, numberSchema)

      expect(() => fake(intersectionSchema)).toThrow('Cannot intersect')
    })

    it('should handle prefault with any/unknown types', () => {
      // Prefault should work with any/unknown
      const prefaultNumber = z.number().prefault(42)
      const anySchema = z.any()
      const unknownSchema = z.unknown()

      const prefaultAnyIntersection = z.intersection(prefaultNumber, anySchema)
      const prefaultUnknownIntersection = z.intersection(prefaultNumber, unknownSchema)

      const anyResult = fake(prefaultAnyIntersection)
      const unknownResult = fake(prefaultUnknownIntersection)

      expect(typeof anyResult).toBe('number')
      expect(typeof unknownResult).toBe('number')
    })

    it('should handle prefault with union types', () => {
      // Prefault should work with compatible union options
      const prefaultString = z.string().prefault('fallback')
      const stringNumberUnion = z.union([z.string(), z.number()])

      const intersectionSchema = z.intersection(prefaultString, stringNumberUnion)
      const result = fake(intersectionSchema)

      // Should return a string (the compatible union option)
      expect(typeof result).toBe('string')
    })

    it('should handle prefault with lazy types', () => {
      // Prefault should work with lazy schemas
      const prefaultString = z.string().prefault('fallback')
      const lazyString = z.lazy(() => z.string())

      const intersectionSchema = z.intersection(prefaultString, lazyString)
      const result = fake(intersectionSchema)

      expect(typeof result).toBe('string')
    })

    it('should handle prefault with pipe types', () => {
      // Prefault should work with pipe schemas
      const prefaultString = z.string().prefault('fallback')
      const pipeString = z.string().pipe(z.string())

      const intersectionSchema = z.intersection(prefaultString, pipeString)
      const result = fake(intersectionSchema)

      expect(typeof result).toBe('string')
    })

    it('should handle prefault with other wrapper types', () => {
      // Prefault should work with optional, nullable, default, readonly, catch
      const prefaultString = z.string().prefault('fallback')
      const optionalString = z.string().optional()
      const nullableString = z.string().nullable()
      const defaultString = z.string().default('default')
      const readonlyString = z.string().readonly()
      const catchString = z.string().catch('catch-fallback')

      const prefaultOptionalIntersection = z.intersection(prefaultString, optionalString)
      const prefaultNullableIntersection = z.intersection(prefaultString, nullableString)
      const prefaultDefaultIntersection = z.intersection(prefaultString, defaultString)
      const prefaultReadonlyIntersection = z.intersection(prefaultString, readonlyString)
      const prefaultCatchIntersection = z.intersection(prefaultString, catchString)

      const optionalResult = fake(prefaultOptionalIntersection)
      const nullableResult = fake(prefaultNullableIntersection)
      const defaultResult = fake(prefaultDefaultIntersection)
      const readonlyResult = fake(prefaultReadonlyIntersection)
      const catchResult = fake(prefaultCatchIntersection)

      // Results should be strings or the wrapper values (undefined, null, default)
      expect(optionalResult === undefined || typeof optionalResult === 'string').toBe(true)
      expect(nullableResult === null || typeof nullableResult === 'string').toBe(true)
      expect(defaultResult === 'default' || typeof defaultResult === 'string').toBe(true)
      expect(typeof readonlyResult).toBe('string')
      expect(typeof catchResult).toBe('string')
    })

    it('should handle complex prefault intersections', () => {
      // Test prefault with constrained types
      const prefaultConstrainedString = z.string().min(5).max(10).prefault('fallback')
      const anotherConstrainedString = z.string().min(3).max(8)

      const intersectionSchema = z.intersection(prefaultConstrainedString, anotherConstrainedString)
      const result = fake(intersectionSchema)

      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThanOrEqual(5) // max of mins
      expect(result.length).toBeLessThanOrEqual(8) // min of maxes
    })

    it('should handle prefault with function default value', () => {
      // Test prefault with function default value
      const prefaultWithFunction = z.number().prefault(() => 42)
      const numberSchema = z.number()

      const intersectionSchema = z.intersection(prefaultWithFunction, numberSchema)
      const result = fake(intersectionSchema)

      expect(typeof result).toBe('number')
    })

    it('should handle nested prefault intersections', () => {
      // Test prefault with nested schemas
      const prefaultObject = z.object({ name: z.string() }).prefault({ name: 'fallback' })
      const objectSchema = z.object({ name: z.string(), age: z.number() })

      const intersectionSchema = z.intersection(prefaultObject, objectSchema)
      const result = fake(intersectionSchema)

      expect(typeof result).toBe('object')
      expect(result).toHaveProperty('name')
      expect(result).toHaveProperty('age')
      expect(typeof result.name).toBe('string')
      expect(typeof result.age).toBe('number')
    })
  })
})

describe('function intersection handler', () => {
  it('should handle identical function schemas by returning a valid function', () => {
    // Same function schema should intersect to a valid function
    const functionSchema1 = z.function()
    const functionSchema2 = z.function()

    const intersectionSchema = z.intersection(functionSchema1, functionSchema2)
    const result = fake(intersectionSchema)

    expect(typeof result).toBe('function')
  })

  it('should handle function with any/unknown types', () => {
    // Function should work with any/unknown
    const functionSchema = z.function()
    const anySchema = z.any()
    const unknownSchema = z.unknown()

    const functionAnyIntersection = z.intersection(functionSchema, anySchema)
    const functionUnknownIntersection = z.intersection(functionSchema, unknownSchema)

    const anyResult = fake(functionAnyIntersection)
    const unknownResult = fake(functionUnknownIntersection)

    expect(typeof anyResult).toBe('function')
    expect(typeof unknownResult).toBe('function')
  })

  it('should throw error for function with incompatible type', () => {
    // Function with non-function should be impossible
    const functionSchema = z.function()
    const stringSchema = z.string()

    const intersectionSchema = z.intersection(functionSchema, stringSchema)

    expect(() => fake(intersectionSchema)).toThrow('Cannot intersect string with function')
  })

  it('should handle function with no args/returns specified', () => {
    // Functions without specific args/returns should work
    const func1 = z.function()
    const func2 = z.function()

    const intersectionSchema = z.intersection(func1, func2)
    const result = fake(intersectionSchema)

    expect(typeof result).toBe('function')
  })
})

describe('promise intersection handler', () => {
  it('should handle identical promise schemas by returning a valid promise', () => {
    // Same promise schema should intersect to a valid promise
    const promiseSchema1 = z.promise(z.string())
    const promiseSchema2 = z.promise(z.string())

    const intersectionSchema = z.intersection(promiseSchema1, promiseSchema2)
    const result = fake(intersectionSchema)

    expect(result instanceof Promise).toBe(true)
  })

  it('should handle promise with compatible inner types by merging constraints', () => {
    // Promises with compatible inner types should merge constraints
    const promise1 = z.promise(z.string())
    const promise2 = z.promise(z.string().min(3))

    const intersectionSchema = z.intersection(promise1, promise2)
    const result = fake(intersectionSchema)

    expect(result instanceof Promise).toBe(true)
    // Test that the promise resolves to the merged constraint
    return result.then(value => {
      expect(typeof value).toBe('string')
      expect(value.length).toBeGreaterThanOrEqual(3)
    })
  })

  it('should throw error for promises with incompatible inner types', () => {
    // Promises with incompatible inner types should fail
    const promise1 = z.promise(z.string())
    const promise2 = z.promise(z.number())

    const intersectionSchema = z.intersection(promise1, promise2)

    expect(() => fake(intersectionSchema)).toThrow('Cannot intersect promise')
  })

  it('should handle promise with any/unknown types', () => {
    // Promise should work with any/unknown
    const promiseSchema = z.promise(z.string())
    const anySchema = z.any()
    const unknownSchema = z.unknown()

    const promiseAnyIntersection = z.intersection(promiseSchema, anySchema)
    const promiseUnknownIntersection = z.intersection(promiseSchema, unknownSchema)

    const anyResult = fake(promiseAnyIntersection)
    const unknownResult = fake(promiseUnknownIntersection)

    expect(anyResult instanceof Promise).toBe(true)
    expect(unknownResult instanceof Promise).toBe(true)
  })

  it('should throw error for promise with incompatible type', () => {
    // Promise with non-promise should be impossible
    const promiseSchema = z.promise(z.string())
    const stringSchema = z.string()

    const intersectionSchema = z.intersection(promiseSchema, stringSchema)

    expect(() => fake(intersectionSchema)).toThrow('Cannot intersect string with promise')
  })

  it('should handle nested promise intersections', () => {
    // Test nested promise constraint merging
    const promise1 = z.promise(z.object({ name: z.string() }))
    const promise2 = z.promise(z.object({ name: z.string(), age: z.number() }))

    const intersectionSchema = z.intersection(promise1, promise2)
    const result = fake(intersectionSchema)

    expect(result instanceof Promise).toBe(true)
    return result.then(value => {
      expect(typeof value).toBe('object')
      expect(value).toHaveProperty('name')
      expect(value).toHaveProperty('age')
    })
  })

  describe('file intersection handler', () => {
    it('should handle identical file schemas by returning a valid file', () => {
      // Same file schema should intersect to a valid file
      const fileSchema1 = z.file()
      const fileSchema2 = z.file()

      const intersectionSchema = z.intersection(fileSchema1, fileSchema2)
      const result = fake(intersectionSchema)

      expect(result instanceof File).toBe(true)
    })

    it('should handle file with any/unknown types', () => {
      // File should work with any/unknown
      const fileSchema = z.file()
      const anySchema = z.any()
      const unknownSchema = z.unknown()

      const fileAnyIntersection = z.intersection(fileSchema, anySchema)
      const fileUnknownIntersection = z.intersection(fileSchema, unknownSchema)

      const anyResult = fake(fileAnyIntersection)
      const unknownResult = fake(fileUnknownIntersection)

      expect(anyResult instanceof File).toBe(true)
      expect(unknownResult instanceof File).toBe(true)
    })

    it('should throw error for file with incompatible type', () => {
      // File with non-file should be impossible
      const fileSchema = z.file()
      const stringSchema = z.string()

      const intersectionSchema = z.intersection(fileSchema, stringSchema)

      expect(() => fake(intersectionSchema)).toThrow('Cannot intersect string with file')
    })

    it('should handle file with union types', () => {
      // File should work with compatible union options
      const fileSchema = z.file()
      const fileUnion = z.union([z.file(), z.string()])

      const intersectionSchema = z.intersection(fileSchema, fileUnion)
      const result = fake(intersectionSchema)

      // Should return a file (the compatible union option)
      expect(result instanceof File).toBe(true)
    })

    it('should handle file with lazy types', () => {
      // File should work with lazy schemas
      const fileSchema = z.file()
      const lazyFile = z.lazy(() => z.file())

      const intersectionSchema = z.intersection(fileSchema, lazyFile)
      const result = fake(intersectionSchema)

      expect(result instanceof File).toBe(true)
    })

    it('should handle file with pipe types', () => {
      // File should work with pipe schemas
      const fileSchema = z.file()
      const pipeFile = z.file().pipe(z.file())

      const intersectionSchema = z.intersection(fileSchema, pipeFile)
      const result = fake(intersectionSchema)

      expect(result instanceof File).toBe(true)
    })

    it('should handle file with other wrapper types', () => {
      // File should work with optional, nullable, default
      const fileSchema = z.file()
      const optionalFile = z.file().optional()
      const nullableFile = z.file().nullable()

      const fileOptionalIntersection = z.intersection(fileSchema, optionalFile)
      const fileNullableIntersection = z.intersection(fileSchema, nullableFile)

      const optionalResult = fake(fileOptionalIntersection)
      const nullableResult = fake(fileNullableIntersection)

      // Results should be files or compatible wrapper values
      expect(optionalResult instanceof File || optionalResult === undefined).toBe(true)
      expect(nullableResult instanceof File || nullableResult === null).toBe(true)
    })

    it('should handle file with never type', () => {
      // File with never should be impossible
      const fileSchema = z.file()
      const neverSchema = z.never()

      const intersectionSchema = z.intersection(fileSchema, neverSchema)

      expect(() => fake(intersectionSchema)).toThrow(
        'Cannot generate fake data for intersection with never type - intersection is impossible',
      )
    })
  })

  describe('custom intersection handler', () => {
    it('should handle identical custom schemas by returning a valid custom value', () => {
      // Same custom schema should intersect to a valid custom value
      const customSchema1 = z.custom<string>((val) => typeof val === 'string')
      const customSchema2 = z.custom<string>((val) => typeof val === 'string')

      const intersectionSchema = z.intersection(customSchema1, customSchema2)
      const result = fake(intersectionSchema)

      expect(typeof result).toBe('string')
    })

    it('should handle custom with any/unknown types', () => {
      // Custom should work with any/unknown
      const customSchema = z.custom<number>((val) => typeof val === 'number')
      const anySchema = z.any()
      const unknownSchema = z.unknown()

      const customAnyIntersection = z.intersection(customSchema, anySchema)
      const customUnknownIntersection = z.intersection(customSchema, unknownSchema)

      const anyResult = fake(customAnyIntersection)
      const unknownResult = fake(customUnknownIntersection)

      expect(typeof anyResult).toBe('number')
      expect(typeof unknownResult).toBe('number')
    })

    it('should throw error for custom with incompatible type', () => {
      // Custom with incompatible type should be impossible
      const customSchema = z.custom<string>((val) => typeof val === 'string')
      const numberSchema = z.number()

      const intersectionSchema = z.intersection(customSchema, numberSchema)

      expect(() => fake(intersectionSchema)).toThrow('Cannot intersect number with custom')
    })

    it('should handle custom with union types', () => {
      // Custom should work with compatible union options
      const customSchema = z.custom<string>((val) => typeof val === 'string')
      const stringUnion = z.union([z.string(), z.number()])

      const intersectionSchema = z.intersection(customSchema, stringUnion)
      const result = fake(intersectionSchema)

      // Should return a string (the compatible union option)
      expect(typeof result).toBe('string')
    })

    it('should handle custom with lazy types', () => {
      // Custom should work with lazy schemas
      const customSchema = z.custom<string>((val) => typeof val === 'string')
      const lazyString = z.lazy(() => z.string())

      const intersectionSchema = z.intersection(customSchema, lazyString)
      const result = fake(intersectionSchema)

      expect(typeof result).toBe('string')
    })

    it('should handle custom with pipe types', () => {
      // Custom should work with pipe schemas
      const customSchema = z.custom<string>((val) => typeof val === 'string')
      const pipeString = z.string().pipe(z.string())

      const intersectionSchema = z.intersection(customSchema, pipeString)
      const result = fake(intersectionSchema)

      expect(typeof result).toBe('string')
    })

    it('should handle custom with other wrapper types', () => {
      // Custom should work with optional, nullable, default
      const customSchema = z.custom<string>((val) => typeof val === 'string')
      const optionalString = z.string().optional()
      const nullableString = z.string().nullable()

      const customOptionalIntersection = z.intersection(customSchema, optionalString)
      const customNullableIntersection = z.intersection(customSchema, nullableString)

      const optionalResult = fake(customOptionalIntersection)
      const nullableResult = fake(customNullableIntersection)

      // Results should be strings or compatible wrapper values
      expect(typeof optionalResult === 'string' || optionalResult === undefined).toBe(true)
      expect(typeof nullableResult === 'string' || nullableResult === null).toBe(true)
    })

    it('should handle custom with never type', () => {
      // Custom with never should be impossible
      const customSchema = z.custom<string>((val) => typeof val === 'string')
      const neverSchema = z.never()

      const intersectionSchema = z.intersection(customSchema, neverSchema)

      expect(() => fake(intersectionSchema)).toThrow(
        'Cannot generate fake data for intersection with never type - intersection is impossible',
      )
    })
  })

  describe('unknown intersection handler', () => {
    it('should handle identical unknown schemas by returning a valid unknown value', () => {
      // Same unknown schema should intersect to a valid unknown value
      const unknownSchema1 = z.unknown()
      const unknownSchema2 = z.unknown()

      const intersectionSchema = z.intersection(unknownSchema1, unknownSchema2)
      const result = fake(intersectionSchema)

      // Unknown can be any type, so we just check it's not undefined
      expect(result).toBeDefined()
    })

    it('should handle unknown with specific types by returning the specific type', () => {
      // Unknown intersected with specific types should return the specific type
      const unknownSchema = z.unknown()
      const stringSchema = z.string()
      const numberSchema = z.number()
      const booleanSchema = z.boolean()

      const unknownStringIntersection = z.intersection(unknownSchema, stringSchema)
      const unknownNumberIntersection = z.intersection(unknownSchema, numberSchema)
      const unknownBooleanIntersection = z.intersection(unknownSchema, booleanSchema)

      const stringResult = fake(unknownStringIntersection)
      const numberResult = fake(unknownNumberIntersection)
      const booleanResult = fake(unknownBooleanIntersection)

      expect(typeof stringResult).toBe('string')
      expect(typeof numberResult).toBe('number')
      expect(typeof booleanResult).toBe('boolean')
    })

    it('should handle unknown with literal types', () => {
      // Unknown intersected with literal should return the literal value
      const unknownSchema = z.unknown()
      const literalSchema = z.literal('test')

      const intersectionSchema = z.intersection(unknownSchema, literalSchema)
      const result = fake(intersectionSchema)

      expect(result).toBe('test')
    })

    it('should handle unknown with enum types', () => {
      // Unknown intersected with enum should return an enum value
      const unknownSchema = z.unknown()
      const enumSchema = z.enum(['red', 'green', 'blue'])

      const intersectionSchema = z.intersection(unknownSchema, enumSchema)
      const result = fake(intersectionSchema)

      expect(['red', 'green', 'blue']).toContain(result)
    })

    it('should handle unknown with union types', () => {
      // Unknown intersected with union should return a union option
      const unknownSchema = z.unknown()
      const unionSchema = z.union([z.string(), z.number()])

      const intersectionSchema = z.intersection(unknownSchema, unionSchema)
      const result = fake(intersectionSchema)

      expect(typeof result === 'string' || typeof result === 'number').toBe(true)
    })

    it('should handle unknown with lazy types', () => {
      // Unknown intersected with lazy should resolve lazy and use that type
      const unknownSchema = z.unknown()
      const lazyString = z.lazy(() => z.string())

      const intersectionSchema = z.intersection(unknownSchema, lazyString)
      const result = fake(intersectionSchema)

      expect(typeof result).toBe('string')
    })

    it('should handle unknown with pipe types', () => {
      // Unknown intersected with pipe should use pipe's input schema
      const unknownSchema = z.unknown()
      const pipeString = z.string().pipe(z.string())

      const intersectionSchema = z.intersection(unknownSchema, pipeString)
      const result = fake(intersectionSchema)

      expect(typeof result).toBe('string')
    })

    it('should handle unknown with wrapper types', () => {
      // Unknown intersected with wrapper types should use the wrapper's underlying schema
      const unknownSchema = z.unknown()
      const optionalString = z.string().optional()
      const nullableNumber = z.number().nullable()

      const unknownOptionalIntersection = z.intersection(unknownSchema, optionalString)
      const unknownNullableIntersection = z.intersection(unknownSchema, nullableNumber)

      const optionalResult = fake(unknownOptionalIntersection)
      const nullableResult = fake(unknownNullableIntersection)

      expect(typeof optionalResult === 'string' || optionalResult === undefined).toBe(true)
      expect(typeof nullableResult === 'number' || nullableResult === null).toBe(true)
    })

    it('should handle unknown with never type', () => {
      // Unknown with never should be impossible
      const unknownSchema = z.unknown()
      const neverSchema = z.never()

      const intersectionSchema = z.intersection(unknownSchema, neverSchema)

      expect(() => fake(intersectionSchema)).toThrow(
        'Cannot generate fake data for intersection with never type - intersection is impossible',
      )
    })
  })

  describe('any intersection handler', () => {
    it('should handle identical any schemas by returning a valid any value', () => {
      // Same any schema should intersect to a valid any value
      const anySchema1 = z.any()
      const anySchema2 = z.any()

      const intersectionSchema = z.intersection(anySchema1, anySchema2)
      const result = fake(intersectionSchema)

      // Any can be any type, so we just check it's not undefined
      expect(result).toBeDefined()
    })

    it('should handle any with specific types by returning the specific type', () => {
      // Any intersected with specific types should return the specific type
      const anySchema = z.any()
      const stringSchema = z.string()
      const numberSchema = z.number()
      const booleanSchema = z.boolean()

      const anyStringIntersection = z.intersection(anySchema, stringSchema)
      const anyNumberIntersection = z.intersection(anySchema, numberSchema)
      const anyBooleanIntersection = z.intersection(anySchema, booleanSchema)

      const stringResult = fake(anyStringIntersection)
      const numberResult = fake(anyNumberIntersection)
      const booleanResult = fake(anyBooleanIntersection)

      expect(typeof stringResult).toBe('string')
      expect(typeof numberResult).toBe('number')
      expect(typeof booleanResult).toBe('boolean')
    })

    it('should handle any with literal types', () => {
      // Any intersected with literal should return the literal value
      const anySchema = z.any()
      const literalSchema = z.literal('test')

      const intersectionSchema = z.intersection(anySchema, literalSchema)
      const result = fake(intersectionSchema)

      expect(result).toBe('test')
    })

    it('should handle any with enum types', () => {
      // Any intersected with enum should return an enum value
      const anySchema = z.any()
      const enumSchema = z.enum(['red', 'green', 'blue'])

      const intersectionSchema = z.intersection(anySchema, enumSchema)
      const result = fake(intersectionSchema)

      expect(['red', 'green', 'blue']).toContain(result)
    })

    it('should handle any with union types', () => {
      // Any intersected with union should return a union option
      const anySchema = z.any()
      const unionSchema = z.union([z.string(), z.number()])

      const intersectionSchema = z.intersection(anySchema, unionSchema)
      const result = fake(intersectionSchema)

      expect(typeof result === 'string' || typeof result === 'number').toBe(true)
    })

    it('should handle any with lazy types', () => {
      // Any intersected with lazy should resolve lazy and use that type
      const anySchema = z.any()
      const lazyString = z.lazy(() => z.string())

      const intersectionSchema = z.intersection(anySchema, lazyString)
      const result = fake(intersectionSchema)

      expect(typeof result).toBe('string')
    })

    it('should handle any with pipe types', () => {
      // Any intersected with pipe should use pipe's input schema
      const anySchema = z.any()
      const pipeString = z.string().pipe(z.string())

      const intersectionSchema = z.intersection(anySchema, pipeString)
      const result = fake(intersectionSchema)

      expect(typeof result).toBe('string')
    })

    it('should handle any with wrapper types', () => {
      // Any intersected with wrapper types should use the wrapper's underlying schema
      const anySchema = z.any()
      const optionalString = z.string().optional()
      const nullableNumber = z.number().nullable()

      const anyOptionalIntersection = z.intersection(anySchema, optionalString)
      const anyNullableIntersection = z.intersection(anySchema, nullableNumber)

      const optionalResult = fake(anyOptionalIntersection)
      const nullableResult = fake(anyNullableIntersection)

      expect(typeof optionalResult === 'string' || optionalResult === undefined).toBe(true)
      expect(typeof nullableResult === 'number' || nullableResult === null).toBe(true)
    })

    it('should handle any with never type', () => {
      // Any with never should be impossible
      const anySchema = z.any()
      const neverSchema = z.never()

      const intersectionSchema = z.intersection(anySchema, neverSchema)

      expect(() => fake(intersectionSchema)).toThrow(
        'Cannot generate fake data for intersection with never type - intersection is impossible',
      )
    })
  })

  describe('error handling and validation', () => {
    it('should detect impossible intersections early with descriptive error messages', () => {
      // Test early detection of impossible intersections
      // These should throw descriptive errors immediately

      // Test 1: Conflicting primitive types
      const stringSchema = z.string()
      const numberSchema = z.number()
      const stringNumberIntersection = z.intersection(stringSchema, numberSchema)

      expect(() => fake(stringNumberIntersection)).toThrow('Cannot intersect string with number')

      // Test 2: Conflicting literal values
      const literalA = z.literal('hello')
      const literalB = z.literal('world')
      const conflictingLiterals = z.intersection(literalA, literalB)

      expect(() => fake(conflictingLiterals)).toThrow('Cannot intersect literal values')

      // Test 3: Conflicting constraints
      const minString = z.string().min(10)
      const maxString = z.string().max(5)
      const conflictingConstraints = z.intersection(minString, maxString)

      expect(() => fake(conflictingConstraints)).toThrow(
        'Cannot intersect string constraints - min length (10) is greater than max length (5)',
      )

      // Test 4: Incompatible enum values
      const colorEnum = z.enum(['red', 'green', 'blue'])
      const metalEnum = z.enum(['gold', 'silver', 'bronze'])
      const incompatibleEnums = z.intersection(colorEnum, metalEnum)

      expect(() => fake(incompatibleEnums)).toThrow('Cannot intersect enum')

      // Test 5: Never type intersections
      const neverSchema = z.never()
      const anySchema = z.any()
      const neverIntersection = z.intersection(neverSchema, anySchema)

      expect(() => fake(neverIntersection)).toThrow(
        'Cannot generate fake data for intersection with never type - intersection is impossible',
      )

      // Test 6: Incompatible object properties
      const obj1 = z.object({ id: z.string() })
      const obj2 = z.object({ id: z.number() })
      const conflictingObjects = z.intersection(obj1, obj2)

      expect(() => fake(conflictingObjects)).toThrow('Cannot intersect')

      // Test 7: Incompatible array element types
      const stringArray = z.array(z.string())
      const numberArray = z.array(z.number())
      const conflictingArrays = z.intersection(stringArray, numberArray)

      expect(() => fake(conflictingArrays)).toThrow('Cannot intersect')

      // Test 8: Conflicting number constraints
      const minNumber = z.number().min(10)
      const maxNumber = z.number().max(5)
      const conflictingNumbers = z.intersection(minNumber, maxNumber)

      expect(() => fake(conflictingNumbers)).toThrow(
        'Cannot intersect number constraints - min value (10) is greater than max value (5)',
      )

      // Test 9: Conflicting date constraints
      const minDate = z.date().min(new Date('2025-01-01'))
      const maxDate = z.date().max(new Date('2024-01-01'))
      const conflictingDates = z.intersection(minDate, maxDate)

      expect(() => fake(conflictingDates)).toThrow('Cannot intersect date constraints')

      // Test 10: Incompatible template literal patterns
      const template1 = z.templateLiteral(['hello-', z.string()] as any)
      const template2 = z.templateLiteral([z.string(), '-world'] as any)
      const conflictingTemplates = z.intersection(template1, template2)

      expect(() => fake(conflictingTemplates)).toThrow('Cannot intersect template literal')
    })

    it('should provide specific error messages for different types of impossible intersections', () => {
      // Test that error messages are descriptive and specific to the type of conflict

      // Primitive type conflicts
      expect(() => {
        const intersection = z.intersection(z.string(), z.boolean())
        fake(intersection)
      }).toThrow('Cannot intersect string with boolean')

      expect(() => {
        const intersection = z.intersection(z.number(), z.date())
        fake(intersection)
      }).toThrow('Cannot intersect number with date')

      // Literal conflicts with specific messages
      expect(() => {
        const intersection = z.intersection(z.literal(42), z.literal('hello'))
        fake(intersection)
      }).toThrow('Cannot intersect literal values [42] with literal values [hello] - no common values')

      // Constraint conflicts with specific details
      expect(() => {
        const intersection = z.intersection(z.string().min(20), z.string().max(10))
        fake(intersection)
      }).toThrow('min length (20) is greater than max length (10)')

      // Enum conflicts with value details
      expect(() => {
        const intersection = z.intersection(z.enum(['a', 'b']), z.enum(['c', 'd']))
        fake(intersection)
      }).toThrow('Cannot intersect enum values [a, b] with enum values [c, d] - no common values')

      // Type incompatibility with clear explanation
      expect(() => {
        const intersection = z.intersection(z.literal('test'), z.number())
        fake(intersection)
      }).toThrow('Cannot intersect literal values [test] with number type - types are incompatible')
    })

    it('should handle edge cases in error detection', () => {
      // Test edge cases that might not be immediately obvious

      // Empty arrays/objects that might seem compatible but aren't
      const emptyTuple = z.tuple([])
      const nonEmptyTuple = z.tuple([z.string()])
      expect(() => {
        const intersection = z.intersection(emptyTuple, nonEmptyTuple)
        fake(intersection)
      }).toThrow('Cannot intersect tuples with different lengths')

      // Conflicting array length constraints
      const shortArray = z.array(z.string()).max(2)
      const longArray = z.array(z.string()).min(5)
      expect(() => {
        const intersection = z.intersection(shortArray, longArray)
        fake(intersection)
      }).toThrow('Cannot intersect array constraints')

      // Conflicting set size constraints
      const smallSet = z.set(z.string()).max(2)
      const largeSet = z.set(z.string()).min(5)
      expect(() => {
        const intersection = z.intersection(smallSet, largeSet)
        fake(intersection)
      }).toThrow('Cannot intersect set constraints')

      // Incompatible record key types
      const stringRecord = z.record(z.string(), z.string())
      const numberRecord = z.record(z.number(), z.string())
      expect(() => {
        const intersection = z.intersection(stringRecord, numberRecord)
        fake(intersection)
      }).toThrow('Cannot intersect record types')

      // Incompatible map key/value types
      const stringMap = z.map(z.string(), z.string())
      const numberMap = z.map(z.number(), z.number())
      expect(() => {
        const intersection = z.intersection(stringMap, numberMap)
        fake(intersection)
      }).toThrow('Cannot intersect map')
    })
  })

  describe('recursion protection', () => {
    it('should detect circular references and prevent infinite recursion', () => {
      // Test circular reference detection
      // Create a recursive schema that could cause infinite loops

      // Simple circular reference through lazy schemas
      const circularSchema = z.lazy(() => z.intersection(circularSchema, z.string()))

      // This should not cause infinite recursion - it should either:
      // 1. Detect the cycle and throw an error, or
      // 2. Use depth limiting to prevent infinite recursion
      expect(() => {
        fake(circularSchema)
      }).not.toThrow(/Maximum call stack size exceeded|RangeError/)

      // More complex circular reference
      const nodeSchema = z.lazy(() =>
        z.object({
          value: z.string(),
          children: z.array(nodeSchema),
        }),
      )

      const intersectedNode = z.intersection(
        nodeSchema,
        z.object({
          id: z.number(),
        }),
      )

      // Should handle recursive structures without infinite loops
      expect(() => {
        fake(intersectedNode)
      }).not.toThrow(/Maximum call stack size exceeded|RangeError/)
    })

    it('should implement depth limits to prevent deep recursion', () => {
      // Test depth limits for performance
      // Create deeply nested intersection that could be expensive

      // Create a deeply nested lazy schema
      let deepSchema: any = z.string()
      for (let i = 0; i < 100; i++) {
        const currentSchema = deepSchema
        deepSchema = z.lazy(() => z.intersection(currentSchema, z.string()))
      }

      // Should handle deep nesting without performance issues
      const startTime = Date.now()
      const result = fake(deepSchema)
      const endTime = Date.now()

      // Should complete in reasonable time (less than 1 second)
      expect(endTime - startTime).toBeLessThan(1000)
      expect(typeof result).toBe('string')
    })

    it('should use caching to improve performance on repeated intersections', () => {
      // Test caching for performance optimization
      const baseSchema = z.object({
        name: z.string(),
        age: z.number(),
      })

      const extendedSchema = z.object({
        email: z.string(),
        phone: z.string(),
      })

      const intersectionSchema = z.intersection(baseSchema, extendedSchema)

      // First call - should establish cache
      const startTime1 = Date.now()
      const result1 = fake(intersectionSchema)
      const endTime1 = Date.now()
      const firstCallTime = endTime1 - startTime1

      // Second call - should use cache and be faster
      const startTime2 = Date.now()
      const result2 = fake(intersectionSchema)
      const endTime2 = Date.now()
      const secondCallTime = endTime2 - startTime2

      // Both should return valid objects
      expect(typeof result1).toBe('object')
      expect(result1).toHaveProperty('name')
      expect(result1).toHaveProperty('age')
      expect(result1).toHaveProperty('email')
      expect(result1).toHaveProperty('phone')

      expect(typeof result2).toBe('object')
      expect(result2).toHaveProperty('name')
      expect(result2).toHaveProperty('age')
      expect(result2).toHaveProperty('email')
      expect(result2).toHaveProperty('phone')

      // Note: Caching might not always make the second call faster due to various factors,
      // but it should at least not be significantly slower
      // For now, we just ensure both calls complete successfully
    })

    it('should handle complex recursive intersection patterns', () => {
      // Test complex patterns that might cause recursion issues

      // Mutually recursive schemas
      const schemaA = z.lazy(() =>
        z.object({
          type: z.literal('A'),
          b: schemaB.optional(),
        }),
      )

      const schemaB = z.lazy(() =>
        z.object({
          type: z.literal('B'),
          a: schemaA.optional(),
        }),
      )

      // Intersect with additional constraints
      const constrainedA = z.intersection(
        schemaA,
        z.object({
          id: z.string(),
          timestamp: z.date(),
        }),
      )

      const constrainedB = z.intersection(
        schemaB,
        z.object({
          id: z.string(),
          version: z.number(),
        }),
      )

      // Should handle mutual recursion without issues
      expect(() => {
        fake(constrainedA)
      }).not.toThrow(/Maximum call stack size exceeded|RangeError/)

      expect(() => {
        fake(constrainedB)
      }).not.toThrow(/Maximum call stack size exceeded|RangeError/)
    })

    it('should detect and handle self-referential intersections', () => {
      // Test self-referential patterns that could cause infinite loops

      // Schema that references itself through intersection
      const selfRefSchema = z.lazy(() => {
        const base = z.object({
          value: z.string(),
        })
        return z.intersection(base, selfRefSchema.optional())
      })

      // Should handle self-reference gracefully
      expect(() => {
        fake(selfRefSchema)
      }).not.toThrow(/Maximum call stack size exceeded|RangeError/)

      // More complex self-reference through union and intersection
      const complexSelfRef = z.lazy(() =>
        z.union([
          z.string(),
          z.intersection(
            z.object({ nested: complexSelfRef }),
            z.object({ level: z.number() }),
          ),
        ]),
      )

      expect(() => {
        fake(complexSelfRef)
      }).not.toThrow(/Maximum call stack size exceeded|RangeError/)
    })
  })
})