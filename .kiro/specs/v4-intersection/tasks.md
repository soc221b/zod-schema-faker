# Implementation Plan: Zod v4 Intersection Schema Support

## Overview

This implementation plan breaks down the v4 intersection schema support into discrete coding tasks following strict TDD
principles. The approach implements handlers in order of schema specificity - more narrowed/specific schemas are handled
before more general ones to ensure proper intersection precedence.

## Schema Specificity Order

The implementation follows this specificity hierarchy (most specific first):

1. **Most Specific**: `never`, `literal`, constants (`nan`, `null`, `undefined`, `void`)
2. **Constrained Types**: `enum`, `template_literal`
3. **Primitives**: `string`, `number`, `bigint`, `boolean`, `date`, `symbol`
4. **Collections**: `tuple`, `object`, `array`, `record`, `map`, `set`
5. **Combinators**: `union`, `lazy`, `pipe`
6. **Wrappers**: `optional`, `nullable`, `default`, `readonly`, `nonoptional`, `catch`, `prefault`
7. **Advanced**: `function`, `promise`, `file`, `custom`
8. **Most General**: `any`, `unknown`

## Tasks

- [x] 1. Set up intersection infrastructure
  - Create `src/v4/internals/schemas/intersection.ts` file
  - Add intersection case to main `rootFake` switch statement in `src/v4/internals/fake.ts`
  - Define core intersection types and utilities
  - _Requirements: 1.4, 3.3, 3.4_

- [x] 1.1 Write property test for basic intersection infrastructure
  - **Property 1: Intersection data validity**
  - **Validates: Requirements 1.1, 1.2**

- [x] 2. Implement never intersection handler (TDD) - Most Specific
  - [x] 2.1 Write failing test for never intersection
    - Test never schema intersection semantics (should always result in never)
    - _Requirements: 2.2_

  - [x] 2.2 Implement never intersection logic
    - Make the test pass with minimal implementation
    - _Requirements: 2.2_

- [x] 3. Implement literal intersection handler (TDD) - Highly Specific
  - [x] 3.1 Write failing test for literal intersection
    - Test literal value compatibility checking
    - Test literal + compatible type intersections
    - _Requirements: 2.2_

  - [x] 3.2 Implement literal intersection logic
    - Make the test pass with minimal implementation
    - _Requirements: 2.2_

- [x] 4. Implement constant type handlers (TDD) - Highly Specific
  - [x] 4.1 Write failing tests for all constant intersections
    - Test nan, null, undefined, void intersection scenarios and compatibility
    - _Requirements: 2.2_

  - [x] 4.2 Implement handleConstantIntersection function
    - Unified handler for all constant types (nan, null, undefined, void)
    - Handles same-type intersections (nan & nan → NaN)
    - Handles compatible intersections (nan & number → NaN)
    - Throws descriptive errors for incompatible intersections
    - Includes swapping logic for proper precedence
    - _Requirements: 2.2_

- [x] 5. Implement enum intersection handler (TDD) - Constrained Type
  - [x] 5.1 Write failing tests for enum intersection
    - Test enum schema intersection behavior (more specific than primitives)
    - Test identical enums, overlapping enums, non-overlapping enums
    - Test enum with compatible/incompatible literals and types
    - _Requirements: 2.2_

  - [x] 5.2 Implement enum intersection logic
    - Unified handler for all enum intersection scenarios
    - Handles identical enums by returning random enum value
    - Handles overlapping enums by finding common values
    - Handles enum with compatible types (literal, string, any, unknown)
    - Throws descriptive errors for incompatible intersections
    - Uses v4 enum structure (entries object vs values array)
    - Added enum support to literal handler for proper precedence
    - _Requirements: 2.2_

- [x] 6. Implement template_literal intersection handler (TDD) - Constrained Type
  - [x] 6.1 Write failing test for template_literal intersection
    - Test template literal schema intersection behavior (more specific than string)
    - _Requirements: 2.2_

  - [x] 6.2 Implement template_literal intersection logic
    - Make the test pass with minimal implementation
    - _Requirements: 2.2_

- [x] 7. Implement string intersection handler (TDD) - Primitive
  - [x] 7.1 Write failing test for string intersection
    - Test length constraints (min/max), pattern matching, format validation
    - Test constraint merging and conflict detection
    - _Requirements: 2.1_

  - [x] 7.2 Implement string intersection logic
    - Make the test pass with minimal implementation
    - Handle length constraints, patterns, and formats
    - _Requirements: 2.1_

- [x] 8. Implement number intersection handler (TDD) - Primitive
  - [x] 8.1 Write failing test for number intersection
    - Test min/max ranges, step constraints, integer requirements
    - Test non-overlapping ranges and conflicting constraints
    - _Requirements: 2.1_

  - [x] 8.2 Implement number intersection logic
    - Make the test pass with minimal implementation
    - Handle numeric constraints and range validation
    - _Requirements: 2.1_

- [x] 9. Implement bigint intersection handler (TDD) - Primitive
  - [x] 9.1 Write failing test for bigint intersection
    - Test bigint constraint merging and validation
    - _Requirements: 2.1_

  - [x] 9.2 Implement bigint intersection logic
    - Make the test pass with minimal implementation
    - _Requirements: 2.1_

- [x] 10. Implement boolean intersection handler (TDD) - Primitive
  - [x] 10.1 Write failing test for boolean intersection
    - Test boolean intersection scenarios
    - _Requirements: 2.1_

  - [x] 10.2 Implement boolean intersection logic
    - Make the test pass with minimal implementation
    - _Requirements: 2.1_

- [x] 11. Implement date intersection handler (TDD) - Primitive
  - [x] 11.1 Write failing test for date intersection
    - Test date constraint merging and validation
    - _Requirements: 2.1_

  - [x] 11.2 Implement date intersection logic
    - Make the test pass with minimal implementation
    - _Requirements: 2.1_

- [x] 12. Implement symbol intersection handler (TDD) - Primitive
  - [x] 12.1 Write failing test for symbol intersection
    - Test symbol intersection scenarios
    - _Requirements: 2.1_

  - [x] 12.2 Implement symbol intersection logic
    - Make the test pass with minimal implementation
    - _Requirements: 2.1_

- [x] 13. Write property test for primitive constraint merging
  - **Property 2: Constraint merging correctness**
  - **Validates: Requirements 2.1**

- [x] 14. Implement tuple intersection handler (TDD) - Collection (Most Specific)
  - [x] 14.1 Write failing test for tuple intersection
    - Test tuple element intersections and length compatibility
    - _Requirements: 2.1, 2.4_

  - [x] 14.2 Implement tuple intersection logic
    - Make the test pass with minimal implementation
    - _Requirements: 2.1, 2.4_

- [x] 15. Implement object intersection handler (TDD) - Collection
  - [x] 15.1 Write failing test for object intersection
    - Test object shape merging and property conflicts
    - Test strict mode and catchall properties
    - _Requirements: 2.1, 2.4_

  - [x] 15.2 Implement object intersection logic
    - Make the test pass with minimal implementation
    - _Requirements: 2.1, 2.4_

- [x] 16. Implement array intersection handler (TDD) - Collection
  - [x] 16.1 Write failing test for array intersection
    - Test length constraints and element type merging
    - Test nested array intersections
    - _Requirements: 2.1, 2.4_

  - [x] 16.2 Implement array intersection logic
    - Make the test pass with minimal implementation
    - _Requirements: 2.1, 2.4_

- [x] 17. Implement record intersection handler (TDD) - Collection
  - [x] 17.1 Write failing test for record intersection
    - Test key/value type intersections
    - _Requirements: 2.1, 2.4_

  - [x] 17.2 Implement record intersection logic
    - Make the test pass with minimal implementation
    - _Requirements: 2.1, 2.4_

- [x] 18. Implement map intersection handler (TDD) - Collection
  - [x] 18.1 Write failing test for map intersection
    - Test key/value type intersections for maps
    - _Requirements: 2.1, 2.4_

  - [x] 18.2 Implement map intersection logic
    - Make the test pass with minimal implementation
    - _Requirements: 2.1, 2.4_

- [x] 19. Implement set intersection handler (TDD) - Collection
  - [x] 19.1 Write failing test for set intersection
    - Test element type intersections for sets
    - _Requirements: 2.1, 2.4_

  - [x] 19.2 Implement set intersection logic
    - Make the test pass with minimal implementation
    - _Requirements: 2.1, 2.4_

- [x] 20. Write property test for recursive intersection resolution
  - **Property 4: Recursive intersection resolution**
  - **Validates: Requirements 2.4**

- [x] 21. Checkpoint - Ensure core functionality works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 22. Implement union intersection handler (TDD) - Combinator
  - [x] 22.1 Write failing test for union intersection
    - Test union option filtering for compatibility
    - Test union + any type intersections
    - _Requirements: 2.2, 2.4_

  - [x] 22.2 Implement union intersection logic
    - Make the test pass with minimal implementation
    - _Requirements: 2.2, 2.4_

- [x] 23. Implement lazy intersection handler (TDD) - Combinator
  - [x] 23.1 Write failing test for lazy intersection
    - Test deferred schema resolution for lazy types
    - _Requirements: 2.4, 3.2_

  - [x] 23.2 Implement lazy intersection logic
    - Make the test pass with minimal implementation
    - _Requirements: 2.4, 3.2_

- [x] 24. Implement pipe intersection handler (TDD) - Combinator
  - [x] 24.1 Write failing test for pipe intersection
    - Test intersection logic with pipe transformations
    - _Requirements: 2.4_

  - [x] 24.2 Implement pipe intersection logic
    - Make the test pass with minimal implementation
    - _Requirements: 2.4_

- [x] 25. Implement optional intersection handler (TDD) - Wrapper
  - [x] 25.1 Write failing test for optional intersection
    - Test optional wrapper semantics preservation
    - _Requirements: 2.3_

  - [x] 25.2 Implement optional intersection logic
    - Make the test pass with minimal implementation
    - _Requirements: 2.3_

- [x] 26. Implement nullable intersection handler (TDD) - Wrapper
  - [x] 26.1 Write failing test for nullable intersection
    - Test nullable wrapper semantics preservation
    - _Requirements: 2.3_

  - [x] 26.2 Implement nullable intersection logic
    - Make the test pass with minimal implementation
    - _Requirements: 2.3_

- [x] 27. Implement default intersection handler (TDD) - Wrapper
  - [x] 27.1 Write failing test for default intersection
    - Test default value handling in intersections
    - _Requirements: 2.3_

  - [x] 27.2 Implement default intersection logic
    - Make the test pass with minimal implementation
    - _Requirements: 2.3_

- [x] 28. Implement readonly intersection handler (TDD) - Wrapper
  - [x] 28.1 Write failing test for readonly intersection
    - Test readonly wrapper semantics preservation
    - _Requirements: 2.3_

  - [x] 28.2 Implement readonly intersection logic
    - Make the test pass with minimal implementation
    - _Requirements: 2.3_

- [x] 29. Implement nonoptional intersection handler (TDD) - Wrapper
  - [x] 29.1 Write failing test for nonoptional intersection
    - Test nonoptional wrapper semantics preservation
    - _Requirements: 2.3_

  - [x] 29.2 Implement nonoptional intersection logic
    - Make the test pass with minimal implementation
    - _Requirements: 2.3_

- [x] 30. Implement catch intersection handler (TDD) - Error Wrapper
  - [x] 30.1 Write failing test for catch intersection
    - Test catch wrapper semantics preservation
    - _Requirements: 2.3_

  - [x] 30.2 Implement catch intersection logic
    - Make the test pass with minimal implementation
    - _Requirements: 2.3_

- [x] 31. Implement prefault intersection handler (TDD) - Error Wrapper
  - [x] 31.1 Write failing test for prefault intersection
    - Test prefault wrapper semantics preservation
    - _Requirements: 2.3_

  - [x] 31.2 Implement prefault intersection logic
    - Make the test pass with minimal implementation
    - _Requirements: 2.3_

- [x] 32. Write property test for cross-type intersection handling
  - **Property 3: Cross-type intersection handling**
  - **Validates: Requirements 2.2, 2.3**

- [x] 33. Implement function intersection handler (TDD) - Advanced
  - [x] 33.1 Write failing test for function intersection
    - Test function schema intersection behavior
    - _Requirements: 2.2_

  - [x] 33.2 Implement function intersection logic
    - Make the test pass with minimal implementation
    - _Requirements: 2.2_

- [x] 34. Implement promise intersection handler (TDD) - Advanced
  - [x] 34.1 Write failing test for promise intersection
    - Test promise schema intersection behavior
    - _Requirements: 2.2_

  - [x] 34.2 Implement promise intersection logic
    - Make the test pass with minimal implementation
    - _Requirements: 2.2_

- [x] 35. Implement file intersection handler (TDD) - Advanced
  - [x] 35.1 Write failing test for file intersection
    - Test file schema intersection behavior
    - _Requirements: 2.2_

  - [x] 35.2 Implement file intersection logic
    - Make the test pass with minimal implementation
    - _Requirements: 2.2_

- [x] 36. Implement custom intersection handler (TDD) - Advanced
  - [x] 36.1 Write failing test for custom intersection
    - Test custom schema intersection semantics
    - _Requirements: 2.2_

  - [x] 36.2 Implement custom intersection logic
    - Make the test pass with minimal implementation
    - _Requirements: 2.2_

- [x] 37. Implement unknown intersection handler (TDD) - General
  - [x] 37.1 Write failing test for unknown intersection
    - Test unknown schema intersection semantics
    - _Requirements: 2.2_

  - [x] 37.2 Implement unknown intersection logic
    - Make the test pass with minimal implementation
    - _Requirements: 2.2_

- [x] 38. Implement any intersection handler (TDD) - Most General
  - [x] 38.1 Write failing test for any intersection
    - Test any schema intersection semantics
    - _Requirements: 2.2_

  - [x] 38.2 Implement any intersection logic
    - Make the test pass with minimal implementation
    - _Requirements: 2.2_

- [x] 39. Implement error handling and validation (TDD)
  - [x] 39.1 Write failing test for impossible intersection detection
    - Test early detection of impossible intersections
    - Test descriptive error message generation
    - _Requirements: 1.3, 3.1_

  - [x] 39.2 Implement comprehensive error detection
    - Make the test pass with minimal implementation
    - _Requirements: 1.3, 3.1_

- [x] 40. Implement recursion protection (TDD)
  - [x] 40.1 Write failing test for recursion protection
    - Test circular reference detection
    - Test depth limits and caching for performance
    - _Requirements: 3.2_

  - [x] 40.2 Implement recursion protection logic
    - Make the test pass with minimal implementation
    - _Requirements: 3.2_

- [x] 41. Write property test for impossible intersection error handling
  - **Property 5: Impossible intersection error handling**
  - **Validates: Requirements 1.3, 3.1**

- [x] 42. Write property test for recursion safety
  - **Property 6: Recursion safety**
  - **Validates: Requirements 3.2**

- [x] 43. Implement optimization features (TDD)
  - [x] 43.1 Write failing test for left/right swapping optimization
    - Test `hasSpecificHandler` utility function
    - Test swapping logic to reduce code duplication
    - _Requirements: 3.4_

  - [x] 43.2 Implement left/right swapping optimization
    - Make the test pass with minimal implementation
    - _Requirements: 3.4_

- [x] 44. Add support for future v4 types (TDD)
  - [x] 44.1 Write failing test for future type handling
    - Test placeholder handlers for int, success, transform
    - Test descriptive errors for unsupported types
    - _Requirements: 1.3_

  - [x] 44.2 Implement future type placeholders
    - Make the test pass with minimal implementation
    - _Requirements: 1.3_

- [ ] 45. Write integration tests
  - Test intersection faker within complete v4 system
  - Test compatibility with existing schema types
  - _Requirements: 1.4, 3.3_

- [ ] 46. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks follow strict TDD principles (Red-Green-Refactor cycle)
- Schema types are implemented in order of specificity (most specific first)
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation follows the distribution strategy from the design document
- All v4 schema types are comprehensively covered in the handlers
- 100% test coverage is enforced as per project standards
- Schema specificity ordering ensures proper intersection precedence
