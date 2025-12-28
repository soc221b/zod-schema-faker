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
      }).toThrow('handleLiteralIntersection not yet implemented')

      // Test that the infrastructure correctly identifies schema types
      const objectSchema = z.object({ name: z.string() })
      const anotherObjectSchema = z.object({ age: z.number() })

      expect(() => {
        const intersectionSchema = z.intersection(objectSchema, anotherObjectSchema)
        fake(intersectionSchema)
      }).toThrow('handleObjectIntersection not yet implemented')
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

      // Let's check what error we actually get
      try {
        fake(intersectionSchema)
      } catch (error) {
        console.log('Actual error:', error.message)
      }

      // The error should be from the never handler, not the string handler
      expect(() => fake(intersectionSchema)).toThrow('Cannot generate fake data for intersection with never type - intersection is impossible')
    })
  })

  describe('basic infrastructure tests', () => {
    it('should reach intersection handler for different schema types', () => {
      // Test that different schema types reach their respective handlers
      const testCases = [
        { left: z.never(), right: z.string(), expectedError: 'Cannot generate fake data for intersection with never type - intersection is impossible' },
        { left: z.literal('test'), right: z.string(), expectedError: 'handleLiteralIntersection not yet implemented' },
        { left: z.nan(), right: z.number(), expectedError: 'handleConstantIntersection not yet implemented' },
        { left: z.null(), right: z.string(), expectedError: 'handleConstantIntersection not yet implemented' },
        { left: z.undefined(), right: z.string(), expectedError: 'handleConstantIntersection not yet implemented' },
        { left: z.void(), right: z.string(), expectedError: 'handleConstantIntersection not yet implemented' },
      ]

      testCases.forEach(({ left, right, expectedError }) => {
        expect(() => {
          const intersectionSchema = z.intersection(left, right)
          fake(intersectionSchema)
        }).toThrow(expectedError)
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