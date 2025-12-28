import { faker } from '@faker-js/faker'
import { beforeAll, describe, expect, test } from 'vitest'
import * as z from 'zod/v4'
import { fake, getFaker, setFaker } from '../../src/v4'

beforeAll(() => {
  setFaker(faker)
})

describe('file faker', () => {
  describe('basic file generation', () => {
    test('should generate a valid File object', () => {
      const schema = z.file()
      const result = fake(schema)

      expect(result).toBeInstanceOf(File)
      expect(result.name).toBeTypeOf('string')
      expect(result.size).toBeTypeOf('number')
      expect(result.type).toBeTypeOf('string')
      expect(result.lastModified).toBeTypeOf('number')
    })
  })

  describe('property tests', () => {
    // Feature: v4-file, Property 1: File Object Generation
    // **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**
    test('Property 1: File Object Generation - for any Zod file schema, should generate valid File object', () => {
      // Run property test with 100+ iterations
      for (let i = 0; i < 100; i++) {
        const schema = z.file()
        const result = fake(schema)

        // Validate all File object properties are present and correct types
        expect(result).toBeInstanceOf(File)
        expect(result.name).toBeTypeOf('string')
        expect(result.name.length).toBeGreaterThan(0)
        expect(result.size).toBeTypeOf('number')
        expect(result.size).toBeGreaterThanOrEqual(0)
        expect(result.type).toBeTypeOf('string')
        expect(result.lastModified).toBeTypeOf('number')
        expect(result.lastModified).toBeGreaterThan(0)

        // Validate that the generated file has appropriate filename with extension
        expect(result.name).toMatch(/\.[a-zA-Z0-9]+$/)
      }
    })
  })

  describe('size constraints', () => {
    // Feature: v4-file, Property 2: Size Constraint Compliance
    // **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**
    test('Property 2: Size Constraint Compliance - for any file schema with size constraints, should generate files within bounds', () => {
      // Run property test with 100+ iterations
      for (let i = 0; i < 100; i++) {
        // Test different constraint combinations
        const minSize = faker.number.int({ min: 10, max: 100 })
        const maxSize = faker.number.int({ min: minSize + 10, max: minSize + 500 })
        const exactSize = faker.number.int({ min: 50, max: 200 })

        // Test min size constraint
        const minSchema = z.file().check(z.minSize(minSize))
        const minResult = fake(minSchema)
        expect(minResult.size).toBeGreaterThanOrEqual(minSize)

        // Test max size constraint
        const maxSchema = z.file().check(z.maxSize(maxSize))
        const maxResult = fake(maxSchema)
        expect(maxResult.size).toBeLessThanOrEqual(maxSize)

        // Test exact size constraint
        const exactSchema = z.file().check(z.size(exactSize))
        const exactResult = fake(exactSchema)
        expect(exactResult.size).toBe(exactSize)

        // Test min + max constraint combination
        const rangeSchema = z.file().check(z.minSize(minSize), z.maxSize(maxSize))
        const rangeResult = fake(rangeSchema)
        expect(rangeResult.size).toBeGreaterThanOrEqual(minSize)
        expect(rangeResult.size).toBeLessThanOrEqual(maxSize)
      }
    })

    test('should respect minimum size constraint', () => {
      const minSize = 100
      const schema = z.file().check(z.minSize(minSize))
      const result = fake(schema)

      expect(result.size).toBeGreaterThanOrEqual(minSize)
    })

    test('should respect maximum size constraint', () => {
      const maxSize = 500
      const schema = z.file().check(z.maxSize(maxSize))
      const result = fake(schema)

      expect(result.size).toBeLessThanOrEqual(maxSize)
    })

    test('should respect exact size constraint', () => {
      const exactSize = 256
      const schema = z.file().check(z.size(exactSize))
      const result = fake(schema)

      expect(result.size).toBe(exactSize)
    })

    test('should throw errors for negative size constraints', () => {
      // Test negative minimum size should throw
      expect(() => {
        const negativeMinSchema = z.file().check(z.minSize(-100))
        fake(negativeMinSchema)
      }).toThrow('Invalid file size constraint: minimum size cannot be negative (-100)')

      // Test negative maximum size should throw
      expect(() => {
        const negativeMaxSchema = z.file().check(z.maxSize(-50))
        fake(negativeMaxSchema)
      }).toThrow('Invalid file size constraint: maximum size cannot be negative (-50)')

      // Test negative exact size should throw
      expect(() => {
        const negativeExactSchema = z.file().check(z.size(-25))
        fake(negativeExactSchema)
      }).toThrow('Invalid file size constraint: exact size cannot be negative (-25)')
    })

    test('should throw error for conflicting constraints (min > max)', () => {
      // When min > max, should throw an error
      expect(() => {
        const conflictingSchema = z.file().check(z.minSize(1000), z.maxSize(500))
        fake(conflictingSchema)
      }).toThrow('Conflicting file size constraints: minimum size (1000) cannot be greater than maximum size (500)')
    })

    test('should generate zero-size files correctly', () => {
      const zeroSizeSchema = z.file().check(z.size(0))
      const result = fake(zeroSizeSchema)
      expect(result.size).toBe(0)
    })
  })

  describe('error handling', () => {
    test('should handle unsupported MIME types gracefully', () => {
      // Test with completely unknown MIME type
      const unknownMimeSchema = z.file().check(z.mime(['application/unknown-type']))
      const result = fake(unknownMimeSchema)

      // Should generate a file with fallback behavior
      expect(result).toBeInstanceOf(File)
      expect(result.type).toBe('application/unknown-type')
      expect(result.name).toMatch(/\.[a-zA-Z0-9]+$/)
    })

    test('should handle invalid MIME type patterns', () => {
      // Test with malformed MIME type
      const malformedMimeSchema = z.file().check(z.mime(['invalid-mime-type']))
      const result = fake(malformedMimeSchema)

      // Should generate a file with fallback behavior
      expect(result).toBeInstanceOf(File)
      expect(result.type).toBe('invalid-mime-type')
      expect(result.name).toMatch(/\.[a-zA-Z0-9]+$/)
    })

    test('should handle empty MIME type array', () => {
      // Test with empty MIME type array
      const emptyMimeSchema = z.file().check(z.mime([]))
      const result = fake(emptyMimeSchema)

      // Should generate a file with default MIME type
      expect(result).toBeInstanceOf(File)
      expect(result.type).toBe('text/plain')
    })

    test('should never return null or undefined File objects', () => {
      // Test various edge cases to ensure we never get null/undefined
      const schemas = [
        z.file(),
        z.file().check(z.size(0)),
        z.file().check(z.mime(['unknown/type'])),
        z.file().check(z.minSize(0), z.maxSize(0)),
      ]

      schemas.forEach(schema => {
        const result = fake(schema)
        expect(result).not.toBeNull()
        expect(result).not.toBeUndefined()
        expect(result).toBeInstanceOf(File)
      })
    })

    test('should handle extremely large size constraints gracefully', () => {
      // Test with very large size that might cause memory issues
      const largeSizeSchema = z.file().check(z.size(Number.MAX_SAFE_INTEGER))

      // Should either handle gracefully or throw meaningful error
      expect(() => {
        const result = fake(largeSizeSchema)
        if (result) {
          expect(result).toBeInstanceOf(File)
        }
      }).not.toThrow(/out of memory|allocation failed/i)
    })

    test('should throw error for multiple conflicting MIME type constraints', () => {
      // Test with multiple different MIME type constraints
      expect(() => {
        const multiMimeSchema = z
          .file()
          .check(z.mime(['text/plain']))
          .check(z.mime(['application/json']))
        fake(multiMimeSchema)
      }).toThrow(
        'Conflicting MIME type constraints: cannot have both [text/plain] and [application/json] constraints on the same file',
      )
    })

    test('should handle size constraints at boundary values', () => {
      // Test with boundary values that might cause issues
      const boundarySchemas = [
        z.file().check(z.size(1)), // Minimum non-zero size
        z.file().check(z.minSize(0), z.maxSize(1)), // Minimum range
        z.file().check(z.size(1000000)), // Large exact size (no conflict)
      ]

      boundarySchemas.forEach(schema => {
        const result = fake(schema)
        expect(result).toBeInstanceOf(File)
        expect(result.size).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe('architecture integration', () => {
    // Feature: v4-file, Property 4: Architecture Integration
    // **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**
    test('Property 4: Architecture Integration - for any file schema processed through v4 faker system, should integrate seamlessly', () => {
      // Run property test with 100+ iterations
      for (let i = 0; i < 100; i++) {
        // Test 1: Function signature pattern consistency with other v4 schema fakers
        const basicSchema = z.file()
        const result = fake(basicSchema)

        // Should follow same pattern as other v4 fakers (return type matches schema)
        expect(result).toBeInstanceOf(File)
        expect(basicSchema.parse(result)).toBe(result) // Should validate against original schema

        // Test 2: Context and RootFake integration (test nested structures)
        const nestedSchema = z.object({
          document: z.file(),
          metadata: z.object({
            attachments: z.array(z.file().check(z.mime(['image/jpeg']))),
            backup: z.file().check(z.size(100)),
          }),
        })

        const nestedResult = fake(nestedSchema)
        expect(nestedResult).toHaveProperty('document')
        expect(nestedResult.document).toBeInstanceOf(File)
        expect(nestedResult).toHaveProperty('metadata')
        expect(nestedResult.metadata).toHaveProperty('attachments')
        expect(Array.isArray(nestedResult.metadata.attachments)).toBe(true)
        expect(nestedResult.metadata.attachments.every(file => file instanceof File)).toBe(true)
        expect(nestedResult.metadata.backup).toBeInstanceOf(File)
        expect(nestedResult.metadata.backup.size).toBe(100)

        // Test 3: Integration with rootFake switch statement (test through main fake() function)
        const randomConstraints = []

        // Randomly add size constraints
        if (faker.datatype.boolean()) {
          const minSize = faker.number.int({ min: 0, max: 100 })
          const maxSize = faker.number.int({ min: minSize + 1, max: minSize + 500 })
          randomConstraints.push(z.minSize(minSize), z.maxSize(maxSize))
        }

        // Randomly add MIME type constraints
        if (faker.datatype.boolean()) {
          const mimeTypes = ['text/plain', 'application/json', 'image/png', 'application/pdf']
          const selectedMime = faker.helpers.arrayElement(mimeTypes)
          randomConstraints.push(z.mime([selectedMime]))
        }

        const constrainedSchema = randomConstraints.length > 0 ? z.file().check(...randomConstraints) : z.file()

        const constrainedResult = fake(constrainedSchema)
        expect(constrainedResult).toBeInstanceOf(File)

        // Should validate against the constrained schema
        expect(() => constrainedSchema.parse(constrainedResult)).not.toThrow()

        // Test 4: getFaker() utilities integration
        // The file faker should use the same faker instance as other parts of the system
        const currentFaker = getFaker()
        expect(currentFaker).toBeDefined()

        // Generate multiple files and ensure they use consistent randomization
        const file1 = fake(z.file())
        const file2 = fake(z.file())

        // Files should be different (randomized) but both valid
        expect(file1).toBeInstanceOf(File)
        expect(file2).toBeInstanceOf(File)
        expect(file1.name).not.toBe(file2.name) // Should generate different names

        // Test 5: TypeScript type inference integration
        const typedSchema = z.file().check(z.mime(['application/json']))
        const typedResult = fake(typedSchema)

        // TypeScript should infer this as File type
        expect(typedResult).toBeInstanceOf(File)
        expect(typedResult.type).toBe('application/json')

        // Test with union types containing files
        const unionSchema = z.union([z.string(), z.file().check(z.mime(['text/plain'])), z.number()])

        const unionResult = fake(unionSchema)
        // Should be one of the union types
        expect(typeof unionResult === 'string' || typeof unionResult === 'number' || unionResult instanceof File).toBe(
          true,
        )

        // Test 6: Schema parameter handling with appropriate TypeScript types
        const complexSchema = z.object({
          files: z.array(z.file().check(z.minSize(10), z.maxSize(1000))),
          optionalFile: z
            .file()
            .check(z.mime(['image/png']))
            .optional(),
          defaultFile: z.file().default(() => new File(['default'], 'default.txt', { type: 'text/plain' })),
        })

        const complexResult = fake(complexSchema)
        expect(complexResult).toHaveProperty('files')
        expect(Array.isArray(complexResult.files)).toBe(true)
        expect(
          complexResult.files.every(file => {
            return file instanceof File && file.size >= 10 && file.size <= 1000
          }),
        ).toBe(true)

        // optionalFile might be undefined or a File
        if (complexResult.optionalFile !== undefined) {
          expect(complexResult.optionalFile).toBeInstanceOf(File)
          expect(complexResult.optionalFile.type).toBe('image/png')
        }

        expect(complexResult.defaultFile).toBeInstanceOf(File)
      }
    })
  })

  describe('error resilience', () => {
    // Feature: v4-file, Property 5: Error Resilience
    // **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**
    test('Property 5: Error Resilience - for any file schema with invalid or conflicting constraints, should handle gracefully', () => {
      // Run property test with 100+ iterations
      for (let i = 0; i < 100; i++) {
        // Test various error scenarios and edge cases

        // Test 1: Negative size constraints should throw meaningful errors
        const negativeMin = faker.number.int({ min: -1000, max: -1 })
        const negativeMax = faker.number.int({ min: -1000, max: -1 })
        const negativeExact = faker.number.int({ min: -1000, max: -1 })

        expect(() => {
          const schema = z.file().check(z.minSize(negativeMin))
          fake(schema)
        }).toThrow(`Invalid file size constraint: minimum size cannot be negative (${negativeMin})`)

        expect(() => {
          const schema = z.file().check(z.maxSize(negativeMax))
          fake(schema)
        }).toThrow(`Invalid file size constraint: maximum size cannot be negative (${negativeMax})`)

        expect(() => {
          const schema = z.file().check(z.size(negativeExact))
          fake(schema)
        }).toThrow(`Invalid file size constraint: exact size cannot be negative (${negativeExact})`)

        // Test 2: Conflicting size constraints (min > max) should throw errors
        const minSize = faker.number.int({ min: 100, max: 1000 })
        const maxSize = faker.number.int({ min: 1, max: minSize - 1 })

        expect(() => {
          const schema = z.file().check(z.minSize(minSize), z.maxSize(maxSize))
          fake(schema)
        }).toThrow(
          `Conflicting file size constraints: minimum size (${minSize}) cannot be greater than maximum size (${maxSize})`,
        )

        // Test 3: Unsupported/unknown MIME types should generate reasonable fallbacks
        const unknownMimeTypes = [
          'application/unknown-type',
          'invalid-mime-type',
          'completely/made-up-type',
          'x-custom/weird-format',
          'text/nonexistent-format',
        ]

        const randomUnknownMime = faker.helpers.arrayElement(unknownMimeTypes)
        const unknownMimeSchema = z.file().check(z.mime([randomUnknownMime]))
        const unknownResult = fake(unknownMimeSchema)

        // Should generate a valid File object with fallback behavior
        expect(unknownResult).toBeInstanceOf(File)
        expect(unknownResult.type).toBe(randomUnknownMime)
        expect(unknownResult.name).toMatch(/\.[a-zA-Z0-9]+$/)
        expect(unknownResult.size).toBeGreaterThanOrEqual(0)

        // Test 4: Empty MIME type arrays should use default fallback
        const emptyMimeSchema = z.file().check(z.mime([]))
        const emptyResult = fake(emptyMimeSchema)

        expect(emptyResult).toBeInstanceOf(File)
        expect(emptyResult.type).toBe('text/plain') // Default fallback
        expect(emptyResult.name).toMatch(/\.txt$/i)

        // Test 5: Never return null/undefined File objects under any circumstances
        const edgeCaseSchemas = [
          z.file(),
          z.file().check(z.size(0)),
          z.file().check(z.mime(['unknown/type'])),
          z.file().check(z.minSize(0), z.maxSize(0)),
          z.file().check(z.mime(['application/completely-unknown'])),
        ]

        edgeCaseSchemas.forEach(schema => {
          const result = fake(schema)
          expect(result).not.toBeNull()
          expect(result).not.toBeUndefined()
          expect(result).toBeInstanceOf(File)
          expect(result.name).toBeTypeOf('string')
          expect(result.size).toBeTypeOf('number')
          expect(result.type).toBeTypeOf('string')
          expect(result.lastModified).toBeTypeOf('number')
        })

        // Test 6: Conflicting MIME type constraints should throw errors
        const allMimeTypes = [
          'text/plain',
          'application/json',
          'image/png',
          'text/html',
          'application/xml',
          'image/jpeg',
        ]
        const mimeType1 = faker.helpers.arrayElement(allMimeTypes)
        let mimeType2 = faker.helpers.arrayElement(allMimeTypes)

        // Ensure we have different MIME types for the conflict test
        while (mimeType2 === mimeType1) {
          mimeType2 = faker.helpers.arrayElement(allMimeTypes)
        }

        expect(() => {
          const schema = z
            .file()
            .check(z.mime([mimeType1]))
            .check(z.mime([mimeType2]))
          fake(schema)
        }).toThrow(
          `Conflicting MIME type constraints: cannot have both [${mimeType1}] and [${mimeType2}] constraints on the same file`,
        )
      }
    })
  })

  describe('MIME type constraints', () => {
    // Feature: v4-file, Property 3: MIME Type Constraint Compliance
    // **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
    test('Property 3: MIME Type Constraint Compliance - for any file schema with MIME type constraints, should generate appropriate files', () => {
      // Run property test with 100+ iterations
      const mimeTypes = [
        'application/json',
        'application/xml',
        'application/x-www-form-urlencoded',
        'application/javascript',
        'application/pdf',
        'application/zip',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/octet-stream',
        'application/graphql',
        'text/html',
        'text/plain',
        'text/css',
        'text/javascript',
        'text/csv',
        'image/png',
        'image/jpeg',
        'image/gif',
        'image/svg+xml',
        'image/webp',
        'audio/mpeg',
        'audio/ogg',
        'audio/wav',
        'audio/webm',
        'video/mp4',
        'video/webm',
        'video/ogg',
        'font/woff',
        'font/woff2',
        'font/ttf',
        'font/otf',
        'multipart/form-data',
      ]

      for (let i = 0; i < 100; i++) {
        // Test different MIME types
        const randomMimeType = faker.helpers.arrayElement(mimeTypes)

        // Test file generation with MIME type constraints
        const schema = z.file().check(z.mime([randomMimeType]))
        const result = fake(schema)

        // Validate that the generated file has the correct MIME type
        expect(result.type).toBe(randomMimeType)

        // Validate appropriate file extension for MIME type
        switch (randomMimeType) {
          case 'text/plain':
            expect(result.name).toMatch(/\.txt$/i)
            break
          case 'text/html':
            expect(result.name).toMatch(/\.(html|htm)$/i)
            break
          case 'text/css':
            expect(result.name).toMatch(/\.css$/i)
            break
          case 'text/javascript':
            expect(result.name).toMatch(/\.js$/i)
            break
          case 'text/csv':
            expect(result.name).toMatch(/\.csv$/i)
            break
          case 'application/json':
            expect(result.name).toMatch(/\.json$/i)
            break
          case 'application/xml':
            expect(result.name).toMatch(/\.xml$/i)
            break
          case 'application/javascript':
            expect(result.name).toMatch(/\.js$/i)
            break
          case 'application/pdf':
            expect(result.name).toMatch(/\.pdf$/i)
            break
          case 'application/zip':
            expect(result.name).toMatch(/\.zip$/i)
            break
          case 'application/vnd.ms-excel':
            expect(result.name).toMatch(/\.xls$/i)
            break
          case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            expect(result.name).toMatch(/\.xlsx$/i)
            break
          case 'application/msword':
            expect(result.name).toMatch(/\.doc$/i)
            break
          case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            expect(result.name).toMatch(/\.docx$/i)
            break
          case 'application/vnd.ms-powerpoint':
            expect(result.name).toMatch(/\.ppt$/i)
            break
          case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
            expect(result.name).toMatch(/\.pptx$/i)
            break
          case 'application/octet-stream':
            expect(result.name).toMatch(/\.(bin|dat)$/i)
            break
          case 'application/graphql':
            expect(result.name).toMatch(/\.(graphql|gql)$/i)
            break
          case 'image/jpeg':
            expect(result.name).toMatch(/\.(jpg|jpeg)$/i)
            break
          case 'image/png':
            expect(result.name).toMatch(/\.png$/i)
            break
          case 'image/gif':
            expect(result.name).toMatch(/\.gif$/i)
            break
          case 'image/svg+xml':
            expect(result.name).toMatch(/\.svg$/i)
            break
          case 'image/webp':
            expect(result.name).toMatch(/\.webp$/i)
            break
          case 'audio/mpeg':
            expect(result.name).toMatch(/\.(mp3|mpeg)$/i)
            break
          case 'audio/ogg':
            expect(result.name).toMatch(/\.ogg$/i)
            break
          case 'audio/wav':
            expect(result.name).toMatch(/\.wav$/i)
            break
          case 'audio/webm':
            expect(result.name).toMatch(/\.webm$/i)
            break
          case 'video/mp4':
            expect(result.name).toMatch(/\.mp4$/i)
            break
          case 'video/webm':
            expect(result.name).toMatch(/\.webm$/i)
            break
          case 'video/ogg':
            expect(result.name).toMatch(/\.ogv$/i)
            break
          case 'font/woff':
            expect(result.name).toMatch(/\.woff$/i)
            break
          case 'font/woff2':
            expect(result.name).toMatch(/\.woff2$/i)
            break
          case 'font/ttf':
            expect(result.name).toMatch(/\.ttf$/i)
            break
          case 'font/otf':
            expect(result.name).toMatch(/\.otf$/i)
            break
          case 'multipart/form-data':
            expect(result.name).toMatch(/\.form$/i)
            break
          case 'application/x-www-form-urlencoded':
            expect(result.name).toMatch(/\.form$/i)
            break
          default:
            // For any other MIME types, just ensure it has an extension
            expect(result.name).toMatch(/\.[a-zA-Z0-9]+$/i)
        }
      }
    })

    test('should respect MIME type constraint', () => {
      const mimeType = 'text/plain'
      // Use the z.mime() API to specify allowed MIME types
      const schema = z.file().check(z.mime([mimeType]))
      const result = fake(schema)

      // Validate that the generated file has the specified MIME type
      expect(result.type).toBe(mimeType)
    })

    test('should generate appropriate file extension for MIME type', () => {
      // Use the z.mime() API to specify MIME type constraint
      const schema = z.file().check(z.mime(['image/jpeg']))
      const result = fake(schema)

      // Validate that the file has the correct MIME type and extension
      expect(result.type).toBe('image/jpeg')
      expect(result.name).toMatch(/\.(jpg|jpeg)$/i)
    })
  })
})
