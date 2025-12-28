# Implementation Plan: Zod v4 File Schema Faker

## Overview

This implementation plan creates a fake data generator for Zod v4 file schema types in the zod-schema-faker library. The
implementation follows the established v4 architecture pattern with a dedicated `fakeFile` function that integrates
seamlessly with the existing faker system.

## Tasks

- [x] 1. Set up test infrastructure and write failing tests (RED phase)
  - [x] 1.1 Create basic file faker test structure
    - Create test file tests/v4/file-faker.test.ts
    - Set up test utilities and imports
    - _Requirements: All requirements - test setup_

  - [x] 1.2 Write failing property test for basic file generation
    - **Property 1: File Object Generation**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**
    - Test should fail initially (no implementation yet)

  - [x] 1.3 Write failing property test for size constraints
    - **Property 2: Size Constraint Compliance**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**
    - Test should fail initially (no implementation yet)

  - [x] 1.4 Write failing property test for MIME type constraints
    - **Property 3: MIME Type Constraint Compliance**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
    - Test should fail initially (no implementation yet)

- [x] 2. Create minimal file faker implementation (GREEN phase)
  - [x] 2.1 Create the fakeFile function in src/v4/internals/schemas/file.ts
    - Write minimal implementation to make basic file generation test pass
    - Handle basic File object generation with name, size, type, and lastModified
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.1, 4.2, 4.5_

  - [x] 2.2 Integrate with existing v4 faker system
    - Update rootFake switch statement to call fakeFile
    - Import fakeFile function from schemas/file
    - _Requirements: 4.3_

- [x] 3. Implement size constraint handling (GREEN phase)
  - [x] 3.1 Add size constraint processing
    - Process min_size, max_size, and size_equals checks
    - Generate file content that meets size requirements exactly
    - Make size constraint tests pass
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 5.1, 5.2_

- [x] 4. Implement MIME type constraint handling (GREEN phase)
  - [x] 4.1 Add MIME type constraint processing
    - Process mime_type checks from Zod v4
    - Generate appropriate file extensions for MIME types
    - Create realistic content based on MIME type
    - Make MIME type constraint tests pass
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 5.3_

- [x] 5. Add content generation utilities (GREEN phase)
  - [x] 5.1 Implement MIME type mapping system
    - Create comprehensive MIME type to file extension mapping
    - Support common MIME types (text/_, image/_, application/\*)
    - _Requirements: 3.3, 3.4_

  - [x] 5.2 Implement content generators for different MIME types
    - Text content generator for text/\* types
    - Binary content generator for image/_ and application/_ types
    - Structured content for application/json, application/xml
    - _Requirements: 3.4, 1.4_

- [x] 6. Add comprehensive error handling (GREEN phase)
  - [x] 6.1 Write failing tests for error scenarios
    - Test invalid constraint scenarios
    - Test conflicting constraints
    - Test unsupported MIME types
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 6.2 Implement error handling to make tests pass
    - Graceful handling of negative size values
    - Resolution of conflicting constraints (min > max)
    - Fallback for unsupported MIME types
    - Ensure never returns null/undefined File objects
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 7. Write additional tests and refactor (RED-GREEN-REFACTOR)
  - [x] 7.1 Write property test for error resilience
    - **Property 5: Error Resilience**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

  - [x] 7.2 Write property test for architecture integration
    - **Property 4: Architecture Integration**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**

  - [x] 7.3 Add file faker to main v4 test suite
    - Add file schema test cases to tests/v4/zod.test.ts
    - Include basic file, size constraints, and MIME type tests
    - Follow existing test patterns in the file
    - _Requirements: 1.1, 2.1, 3.1_

- [x] 8. Refactor and optimize (REFACTOR phase)
  - [x] 8.1 Refactor code for better maintainability
    - Extract common utilities
    - Improve error handling structure
    - Optimize performance where needed
    - Ensure all tests still pass

  - [x] 8.2 Write unit tests for edge cases
    - Test empty files, maximum size files
    - Test unknown MIME types and fallback behavior
    - Test constraint boundary conditions
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 9. Final validation and cleanup
  - [x] 9.1 Run full test suite and ensure 100% coverage
    - Verify all property tests pass with 100+ iterations
    - Ensure unit tests cover edge cases
    - Validate integration with existing v4 system
    - _Requirements: All requirements_

  - [x] 9.2 Final checkpoint - Ensure all tests pass
    - Ensure all tests pass, ask the user if questions arise.

## Notes

- The implementation follows **Test-Driven Development (TDD)** with Red-Green-Refactor cycles
- **RED**: Write failing tests first to define expected behavior
- **GREEN**: Write minimal code to make tests pass
- **REFACTOR**: Improve code quality while keeping tests green
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation follows the established v4 faker architecture patterns
- File generation uses browser File constructor with appropriate polyfills for Node.js compatibility
- 100% test coverage is required as per project standards
