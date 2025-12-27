# Design Document: v4 Missing Schema Implementations

## Overview

This design document outlines the implementation of missing v4 Zod schema types in the zod-schema-faker library. Based
on the requirements analysis, the missing schema types that need implementation are:

1. **file** - File validation schema for handling File objects
2. **intersection** - Intersection of multiple schemas for complex type combinations

These implementations will follow the established v4 architecture patterns, using function-based faker implementations
that integrate with the existing `rootFake` dispatcher and context system. The implementation must meet strict quality
standards including TypeScript compilation, build success, code formatting, and 100% test coverage.

## Architecture

### Current v4 Architecture Pattern

The v4 implementation follows a consistent pattern:

```typescript
// Each schema type has its own file in src/v4/internals/schemas/
export function fake{SchemaType}<T extends core.$Zod{SchemaType}>(
  schema: T,
  context: Context,
  rootFake: typeof internalFake,
): Infer<T> {
  // Implementation logic
}
```

### Integration Points

1. **Main Dispatcher**: Update `src/v4/internals/fake.ts` to handle new schema types and remove TODO comments
   (Requirements 3.1, 3.2, 3.3)
2. **Schema Files**: Create individual implementation files in `src/v4/internals/schemas/`
3. **Type System**: Leverage existing `Infer<T>`, `Context`, and `RootFake` types
4. **Testing**: Follow existing test patterns in `tests/v4/zod.test.ts` (Requirements 5.5)
5. **Quality Compliance**: Ensure all implementations pass TypeScript compilation, Vite build, Prettier formatting, and
   Vitest testing (Requirements 4.1-4.5)

## Components and Interfaces

### File Schema Implementation

**Location**: `src/v4/internals/schemas/file.ts`

**Purpose**: Generate fake File objects that satisfy Zod file validation constraints

**Design Rationale**: File objects are essential for testing file upload functionality without requiring actual files.
The implementation must generate valid File instances that pass `instanceof File` checks and satisfy all schema
constraints.

**Key Features**:

- Generate File objects with realistic MIME types using faker.js (Requirements 1.4)
- Support size constraints (min/max file size validation) (Requirements 1.3)
- Support MIME type restrictions and validation (Requirements 1.2)
- Generate realistic file names with appropriate extensions (Requirements 1.4)
- Throw TypeError for unsupported MIME types or impossible constraints (Requirements 1.5, 1.6)
- Ensure generated File objects pass instanceof File checks (Requirements 1.1)

**Interface**:

```typescript
export function fakeFile<T extends core.$ZodFile>(schema: T, context: Context, rootFake: typeof internalFake): Infer<T>
```

**Implementation Approach**:

- Use `@faker-js/faker` to generate realistic file names and appropriate extensions
- Create File objects using `new File([content], filename, { type: mimeType })`
- Parse schema checks for size and MIME type constraints
- Generate appropriate binary content for different file types
- Validate constraints and throw TypeError for impossible combinations (e.g., min > max size)
- Handle browser compatibility for File constructor availability

### Intersection Schema Implementation

**Location**: `src/v4/internals/schemas/intersection.ts`

**Purpose**: Generate fake data that satisfies the intersection of multiple schemas

**Design Rationale**: Intersection types represent composite schema requirements where generated data must satisfy all
component schemas simultaneously. This is critical for testing complex type combinations in applications.

**Key Features**:

- Combine constraints from multiple schemas intelligently (Requirements 2.2)
- Handle complex intersections (objects, primitives, unions) (Requirements 2.3)
- Recursive intersection resolution using context system (Requirements 2.5)
- Schema compatibility checking and validation (Requirements 2.2)
- Merge object properties from all component schemas (Requirements 2.1)
- Fallback strategies and error handling for incompatible intersections (Requirements 2.4)

**Interface**:

```typescript
export function fakeIntersection<T extends core.$ZodIntersection>(
  schema: T,
  context: Context,
  rootFake: typeof internalFake,
): Infer<T>
```

**Implementation Approach**:

- Adapt existing v3 intersection logic to v4 function-based architecture
- Implement schema compatibility checking before attempting intersection
- Use recursive `rootFake` calls for nested schema resolution
- Handle object schema merging by combining properties from all components
- Implement constraint merging for primitive types
- Throw TypeError for incompatible schema combinations
- Use context system for recursion control and circular reference detection

### Main Dispatcher Integration

**Location**: `src/v4/internals/fake.ts`

**Purpose**: Route new schema types to their appropriate faker implementations

**Design Rationale**: The main dispatcher serves as the central routing mechanism for all schema types. Integration of
new schema types must maintain the existing error handling patterns while removing TODO comments for implemented
functionality.

**Key Features**:

- Route 'file' schema types to the fakeFile function (Requirements 3.1)
- Route 'intersection' schema types to the fakeIntersection function (Requirements 3.2)
- Remove TODO comments for implemented schema types (Requirements 3.3)
- Maintain existing error handling patterns for unsupported types (Requirements 3.4)

**Implementation Approach**:

- Add case statements for 'file' and 'intersection' in the main switch statement
- Import the new faker functions from their respective schema files
- Remove or update TODO comments that reference the newly implemented types
- Ensure consistent error handling and type safety

## Data Models

### Schema Check Processing

Each implementation will process schema checks using a consistent pattern:

```typescript
for (const check of (schema._zod.def.checks ?? []) as core.$ZodChecks[]) {
  switch (check._zod.def.check) {
    case 'specific_check_type':
      // Handle specific constraint
      break
    // ... other cases
  }
}
```

### Context Handling

All implementations will respect the existing context system:

```typescript
type Context = {
  depth: number // For recursion control
}
```

### Error Handling

Implementations will throw `TypeError` for unsupported or impossible schema combinations, following the existing pattern
in `rootFake`.

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a
formal statement about what the system should do. Properties serve as the bridge between human-readable specifications
and machine-verifiable correctness guarantees._

### Property 1: File Generation Validity

_For any_ valid file schema with constraints, the generated File object should satisfy all specified constraints (size,
MIME type) and be a valid File instance. **Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Intersection Schema Compatibility

_For any_ intersection schema where the component schemas are compatible, the generated data should satisfy all
component schema validations. **Validates: Requirements 2.1, 2.2, 2.3**

### Property 3: Schema Type Dispatch Correctness

_For any_ of the new schema types (file, intersection), the main dispatcher should correctly route to the appropriate
faker function. **Validates: Requirements 3.1, 3.2**

### Property 4: Recursive Context Preservation

_For any_ nested schema structure involving the new types, the context depth should be properly maintained and passed
through recursive calls. **Validates: Requirements 2.5**

### Property 5: Build Quality Compliance

_For any_ implementation changes, all build processes (TypeScript compilation, Vite build, Prettier formatting, Vitest
testing) should complete successfully with exit code 0. **Validates: Requirements 4.1, 4.2, 4.3, 4.4**

## Error Handling

### File Schema Errors

- **Invalid MIME type constraints**: Throw TypeError for unsupported MIME types (Requirements 1.5)
- **Impossible size constraints**: Throw TypeError when min > max size (Requirements 1.6)
- **Browser compatibility**: Handle File constructor availability

### Intersection Schema Errors

- **Incompatible schemas**: Throw TypeError when schemas cannot be intersected (Requirements 2.4)
- **Circular references**: Handle infinite recursion in complex intersections using context system (Requirements 2.5)
- **Type conflicts**: Throw TypeError for contradictory type requirements

### General Error Patterns

- Follow existing error handling in `rootFake` dispatcher
- Use descriptive error messages for debugging
- Maintain consistency with v3 error behavior where applicable

## Testing Strategy

### Dual Testing Approach

The implementation will use both unit tests and property-based tests for comprehensive coverage:

**Unit Tests**:

- Test specific examples and edge cases for each schema type (Requirements 5.2)
- Verify error conditions and boundary cases (Requirements 5.4)
- Test integration with existing schema types
- Validate generated data against schema constraints (Requirements 5.3)

**Property-Based Tests**:

- Test universal properties across randomly generated schema configurations
- Verify correctness properties with minimum 100 iterations per test (Requirements 5.1)
- Use property-based testing library (Vitest with custom generators)
- Tag each test with format: **Feature: v4-missing-schemas, Property {number}: {property_text}**

### Test Configuration

- Minimum 100 iterations per property test
- Each property test references its design document property
- Integration with existing test suite in `tests/v4/zod.test.ts`
- Follow existing test patterns and naming conventions

### Coverage Requirements

- 100% test coverage threshold (existing project requirement) (Requirements 4.5)
- Test all new schema types in isolation and combination
- Verify integration with existing v4 functionality
- Test error conditions and edge cases comprehensively (Requirements 5.4)
- Follow existing test patterns and naming conventions in the v4 test suite (Requirements 5.5)
