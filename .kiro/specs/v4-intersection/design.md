# Design Document: Zod v4 Intersection Schema Support

## Overview

This design implements intersection schema support for the zod-schema-faker v4 system. Intersection schemas combine two
schemas where generated fake data must satisfy both schemas simultaneously. The implementation follows the existing v4
function-based architecture and integrates seamlessly with the current schema resolution system.

The key challenge is determining when two schemas can be meaningfully intersected and generating data that satisfies
both constraints. This requires sophisticated schema analysis and constraint merging logic.

Additionally, this design includes a discovery system that uses Property-Based Testing (PBT) to systematically find gaps in intersection support by generating random Zod v4 built-in intersection schemas with all their checks and identifying cases where Zod accepts the schema but the faker fails to generate valid data.

## Architecture

### Core Components

The intersection implementation consists of four main components:

1. **Intersection Faker Function** (`fakeIntersection`): The main entry point that handles intersection schema
   processing
2. **Schema Resolver**: Logic for determining how to combine different schema types
3. **Constraint Merger**: Utilities for merging compatible constraints from both schemas
4. **Discovery System**: Property-based testing system for finding unsupported intersection combinations

### Integration Points

- **Main Faker Switch**: Add intersection case to the main `rootFake` switch statement
- **Schema Type System**: Leverage existing Zod v4 type definitions and schema introspection
- **Context System**: Reuse existing context for depth tracking and configuration
- **Error Handling**: Follow existing error patterns with descriptive TypeError messages

## Components and Interfaces

### Intersection Faker Function

```typescript
export function fakeIntersection<T extends core.$ZodIntersection>(
  schema: T,
  context: Context,
  rootFake: typeof internalFake,
): Infer<T>
```

**Responsibilities:**

- Extract left and right schemas from intersection definition
- Distribute based on left schema type, swapping left/right when beneficial
- Recursively handle nested intersections
- Handle error cases when intersection is impossible
- Return generated data that satisfies both schemas

### Distribution Strategy

The main function uses a distribution approach based on the left schema type:

**Primary Distribution (Left Schema Type):**

- **Primitives**: `string`, `number`, `bigint`, `boolean`, `date`, `symbol`
- **Literals**: `literal`, `nan`, `null`, `undefined`, `void`
- **Collections**: `array`, `object`, `record`, `map`, `set`, `tuple`
- **Wrappers**: `optional`, `nullable`, `default`, `readonly`, `nonoptional`
- **Combinators**: `union`, `lazy`, `pipe`
- **Special**: `any`, `unknown`, `never`, `custom`
- **Advanced**: `function`, `promise`, `file`, `enum`, `template_literal`
- **Error Handling**: `catch`, `prefault`
- **Future**: `int`, `success`, `transform` (TODO in v4)

**Symmetry Optimization:** When the right schema type has more specific handling logic than the left, the function swaps
left and right schemas and recurses. This reduces code duplication by ensuring we only need to implement each
combination once.

**Recursive Resolution:** For nested intersections (e.g., `(A & B) & C`), the function recursively resolves the inner
intersection first, then applies the outer intersection logic.

**Impossible Intersections:**

- Conflicting literals (e.g., literal("a") & literal("b"))
- Incompatible primitive types (e.g., string & number)
- Non-overlapping constraints (e.g., min(10) & max(5))

### Distribution Implementation

The distribution approach eliminates the need for a separate schema resolver by handling combinations directly in the
main function:

```typescript
function fakeIntersection(schema, context, rootFake) {
  const { left, right } = schema._zod.def

  // Handle based on left schema type
  switch (left._zod.def.type) {
    // Primitives - merge constraints
    case 'string':
      return handleStringIntersection(left, right, context, rootFake)
    case 'number':
      return handleNumberIntersection(left, right, context, rootFake)
    case 'bigint':
      return handleBigIntIntersection(left, right, context, rootFake)
    case 'boolean':
      return handleBooleanIntersection(left, right, context, rootFake)
    case 'date':
      return handleDateIntersection(left, right, context, rootFake)
    case 'symbol':
      return handleSymbolIntersection(left, right, context, rootFake)

    // Literals - check compatibility
    case 'literal':
      return handleLiteralIntersection(left, right, context, rootFake)
    case 'nan':
    case 'null':
    case 'undefined':
    case 'void':
      return handleConstantIntersection(left, right, context, rootFake)

    // Collections - merge structures
    case 'object':
      return handleObjectIntersection(left, right, context, rootFake)
    case 'array':
      return handleArrayIntersection(left, right, context, rootFake)
    case 'record':
      return handleRecordIntersection(left, right, context, rootFake)
    case 'map':
      return handleMapIntersection(left, right, context, rootFake)
    case 'set':
      return handleSetIntersection(left, right, context, rootFake)
    case 'tuple':
      return handleTupleIntersection(left, right, context, rootFake)

    // Wrappers - handle wrapper logic
    case 'optional':
    case 'nullable':
    case 'default':
    case 'readonly':
    case 'nonoptional':
      return handleWrapperIntersection(left, right, context, rootFake)

    // Combinators - special handling
    case 'union':
      return handleUnionIntersection(left, right, context, rootFake)
    case 'lazy':
      return handleLazyIntersection(left, right, context, rootFake)
    case 'pipe':
      return handlePipeIntersection(left, right, context, rootFake)

    // Special types
    case 'any':
      return handleAnyIntersection(left, right, context, rootFake)
    case 'unknown':
      return handleUnknownIntersection(left, right, context, rootFake)
    case 'never':
      return handleNeverIntersection(left, right, context, rootFake)
    case 'custom':
      return handleCustomIntersection(left, right, context, rootFake)

    // Advanced types
    case 'function':
      return handleFunctionIntersection(left, right, context, rootFake)
    case 'promise':
      return handlePromiseIntersection(left, right, context, rootFake)
    case 'file':
      return handleFileIntersection(left, right, context, rootFake)
    case 'enum':
      return handleEnumIntersection(left, right, context, rootFake)
    case 'template_literal':
      return handleTemplateLiteralIntersection(left, right, context, rootFake)

    // Error handling wrappers
    case 'catch':
      return handleCatchIntersection(left, right, context, rootFake)
    case 'prefault':
      return handlePrefaultIntersection(left, right, context, rootFake)

    // Future v4 types (currently TODO)
    case 'int':
    case 'success':
    case 'transform':
      throw new TypeError(`Intersection with ${left._zod.def.type} not yet supported`)

    default:
      // If right schema has more specific handling, swap and recurse
      if (hasSpecificHandler(right._zod.def.type)) {
        return fakeIntersection(createIntersection(right, left), context, rootFake)
      }
      // Handle generic cases or throw error for impossible intersections
      return handleGenericIntersection(left, right, context, rootFake)
  }
}
```

This approach reduces code duplication by ensuring each type combination is handled in only one direction.

## Discovery System Architecture

### Property-Based Schema Generation

The discovery system uses property-based testing to systematically explore the intersection space:

```typescript
// Schema generator that creates valid Zod v4 built-in schemas with all their checks
function generateRandomZodSchema(depth: number = 0): z.ZodType {
  const schemaTypes = [
    'string', 'number', 'boolean', 'date', 'bigint', 'symbol',
    'literal', 'enum', 'object', 'array', 'tuple', 'record',
    'map', 'set', 'union', 'optional', 'nullable', 'default',
    'readonly', 'nonoptional', 'lazy', 'pipe', 'catch', 'prefault',
    'function', 'promise', 'file', 'custom', 'any', 'unknown', 'never',
    'template_literal', 'nan', 'null', 'undefined', 'void'
  ]

  // Generate based on weighted distribution
  const type = weightedChoice(schemaTypes, depth)
  return createSchemaOfTypeWithAllChecks(type, depth)
}

// Intersection discovery test
function discoverIntersectionGaps() {
  for (let i = 0; i < 1000; i++) {
    const leftSchema = generateRandomZodSchema()
    const rightSchema = generateRandomZodSchema()

    try {
      // Test if Zod accepts this intersection
      const intersectionSchema = z.intersection(leftSchema, rightSchema)

      // Test if our faker can handle it
      const fakeData = fake(intersectionSchema)

      // Verify the fake data validates against the intersection
      intersectionSchema.parse(fakeData)

    } catch (error) {
      // Capture gap: Zod accepts but faker fails
      captureGap(leftSchema, rightSchema, error)
    }
  }
}
```

### Gap Analysis Categories

The discovery system categorizes gaps into actionable categories:

1. **Unimplemented Schema Types**: New Zod types not yet supported
2. **Missing Constraint Handlers**: Specific constraint combinations not handled
3. **Edge Case Failures**: Rare combinations that cause unexpected errors
4. **Performance Issues**: Valid intersections that are too slow to generate

### Discovery Test Structure

```typescript
describe('Intersection Discovery Tests', () => {
  it('should discover unsupported primitive combinations', () => {
    // Generate random primitive schema pairs
    // Test intersection support systematically
  })

  it('should discover unsupported collection combinations', () => {
    // Generate random collection schema pairs
    // Test nested intersection support
  })

  it('should discover constraint merging gaps', () => {
    // Generate schemas with various constraints
    // Test constraint compatibility detection
  })
})
```

## Data Models

### Schema Type Classification

```typescript
type SchemaCategory =
  | 'primitive' // string, number, bigint, boolean, date, symbol
  | 'literal' // literal, nan, null, undefined, void
  | 'collection' // object, array, record, map, set, tuple
  | 'wrapper' // optional, nullable, default, readonly, nonoptional
  | 'combinator' // union, lazy, pipe
  | 'special' // any, unknown, never, custom
  | 'advanced' // function, promise, file, enum, template_literal
  | 'error_handler' // catch, prefault
  | 'future' // int, success, transform (TODO in v4)
```

| 'special' // any, unknown, never, etc.

````

### Intersection Resolution Result

```typescript
type IntersectionResult<T> = { type: 'success'; schema: T } | { type: 'impossible'; reason: string }
````

### Constraint Definitions

```typescript
interface StringConstraints {
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  format?: string
}

interface NumberConstraints {
  min?: number
  max?: number
  step?: number
  int?: boolean
}

interface ObjectConstraints {
  shape: Record<string, ZodType>
  strict?: boolean
  catchall?: ZodType
}
```

### Discovery System Data Models

```typescript
interface DiscoveryGap {
  leftSchema: SerializedSchema
  rightSchema: SerializedSchema
  errorType: 'unimplemented' | 'constraint_conflict' | 'edge_case' | 'performance'
  errorMessage: string
  zodAccepts: boolean
  fakerFails: boolean
  timestamp: Date
}

interface SerializedSchema {
  type: string
  constraints?: Record<string, any>
  nested?: SerializedSchema[]
}

interface GapAnalysisReport {
  totalTests: number
  gapsFound: number
  gapsByCategory: Record<string, DiscoveryGap[]>
  priorityGaps: DiscoveryGap[]
  recommendations: string[]
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a
formal statement about what the system should do. Properties serve as the bridge between human-readable specifications
and machine-verifiable correctness guarantees._

<function_calls> <invoke name="prework"> <parameter name="featureName">v4-intersection

### Property Reflection

After reviewing the prework analysis, I identified several properties that can be consolidated:

- Properties 1.1 and 1.2 both test successful data generation for valid intersections - these can be combined
- Properties 1.3 and 3.1 both test error handling for impossible intersections - these are redundant
- Properties 2.1, 2.2, 2.3, and 2.4 all test different aspects of schema resolution but can be streamlined

The consolidated properties focus on the core behaviors while eliminating redundancy.

### Correctness Properties

Property 1: Intersection data validity _For any_ valid intersection schema, the generated fake data should pass
validation against both the left and right schemas **Validates: Requirements 1.1, 1.2**

Property 2: Constraint merging correctness _For any_ pair of compatible schemas of the same type, intersecting them
should produce data that satisfies the merged constraints from both schemas **Validates: Requirements 2.1**

Property 3: Cross-type intersection handling _For any_ pair of schemas with different but compatible types, the
intersection should generate data that satisfies both type requirements where overlap exists **Validates: Requirements
2.2, 2.3**

Property 4: Recursive intersection resolution _For any_ nested intersection involving complex schemas (objects, arrays,
unions), all nested intersections should be resolved correctly at every level **Validates: Requirements 2.4**

Property 5: Impossible intersection error handling _For any_ pair of schemas that cannot be meaningfully intersected,
the system should throw a TypeError with a descriptive message explaining why the intersection is impossible
**Validates: Requirements 1.3, 3.1**

Property 6: Recursion safety _For any_ self-referential schema in an intersection, the resolution process should
terminate without infinite recursion while still producing valid results **Validates: Requirements 3.2**

Property 7: Discovery system schema generation _For any_ generated random Zod v4 built-in intersection schema with all their checks, the schema should be valid according to Zod's parser and represent a meaningful intersection test case **Validates: Requirements 4.1, 4.5**

Property 8: Gap detection accuracy _For any_ intersection schema that Zod accepts but the faker fails to handle, the discovery system should capture the schema structure and error details with complete information for analysis **Validates: Requirements 4.2**

Property 9: Gap categorization correctness _For any_ set of discovered gaps, the analysis system should categorize them by schema type combinations and error patterns in a way that enables prioritized fixing **Validates: Requirements 4.3, 4.4**

## Error Handling

### Error Categories

**Impossible Intersections:**

- Conflicting literal values: `z.literal("a").and(z.literal("b"))`
- Incompatible primitive types: `z.string().and(z.number())`
- Non-overlapping constraints: `z.number().min(10).and(z.number().max(5))`

**Recursion Protection:**

- Detect circular references in schema definitions
- Implement depth limits to prevent stack overflow
- Cache resolution results to avoid redundant processing

### Error Messages

Error messages should be descriptive and actionable:

```typescript
// Example error messages
"Cannot intersect literal 'a' with literal 'b' - values are incompatible"
'Cannot intersect string and number types - no valid intersection exists'
'Number constraints conflict: min(10) cannot be satisfied with max(5)'
'Circular reference detected in intersection resolution'
```

### Error Handling Strategy

1. **Early Detection**: Identify impossible intersections before attempting data generation
2. **Graceful Degradation**: For edge cases, prefer throwing descriptive errors over generating invalid data
3. **Context Preservation**: Include schema information in error messages for debugging
4. **Consistent Patterns**: Follow existing v4 error handling conventions

## Testing Strategy

### Dual Testing Approach

The implementation requires both unit tests and property-based tests for comprehensive coverage:

**Unit Tests:**

- Specific intersection scenarios (object + object, string + string, etc.)
- Known impossible combinations and their error messages
- Edge cases like empty objects, optional fields, and wrapper schemas
- Integration with existing v4 faker system

**Property-Based Tests:**

- Universal properties across all valid intersection combinations
- Constraint merging correctness across random schema pairs
- Error handling for randomly generated impossible intersections
- Recursion safety with randomly generated nested structures

### Property-Based Testing Configuration

- **Framework**: Vitest with custom property test utilities
- **Iterations**: Minimum 100 iterations per property test, 1000+ for discovery tests
- **Test Tags**: Each property test references its design document property
- **Coverage**: 100% code coverage requirement maintained
- **Discovery Mode**: Separate test suite for gap discovery with extended iteration counts

### Discovery Testing Strategy

The discovery system uses an extended property-based testing approach:

**Schema Generation Strategy:**
- Weighted random generation favoring common schema types
- Depth-limited recursive generation for complex schemas
- Comprehensive constraint variation to test all Zod v4 built-in checks and validations
- Bias toward known problematic combinations

**Gap Detection Process:**
1. Generate random left and right schemas
2. Create intersection schema using Zod
3. Attempt to generate fake data using our faker
4. Validate generated data against intersection schema
5. Capture any failures with full context

**Analysis and Reporting:**
- Categorize gaps by schema type patterns
- Identify high-priority gaps based on frequency
- Generate actionable recommendations for implementation
- Track gap resolution over time

### Test Organization

```typescript
// Property test example structure
describe('Intersection Faker Properties', () => {
  it('Property 1: Intersection data validity', () => {
    // **Feature: v4-intersection, Property 1: Intersection data validity**
    // Generate random valid intersection schemas and verify data validity
  })

  it('Property 2: Constraint merging correctness', () => {
    // **Feature: v4-intersection, Property 2: Constraint merging correctness**
    // Test constraint merging across same-type schema pairs
  })
})

// Discovery test structure
describe('Intersection Discovery System', () => {
  it('Property 7: Discovery system schema generation', () => {
    // **Feature: v4-intersection, Property 7: Discovery system schema generation**
    // Test that generated schemas are valid and diverse
  })

  it('Property 8: Gap detection accuracy', () => {
    // **Feature: v4-intersection, Property 8: Gap detection accuracy**
    // Test gap capture and analysis functionality
  })

  it('Property 9: Gap categorization correctness', () => {
    // **Feature: v4-intersection, Property 9: Gap categorization correctness**
    // Test gap analysis and reporting
  })
})
```

### Integration Testing

- Test intersection faker within the complete v4 system
- Verify compatibility with existing schema types
- Test performance with complex nested intersections
- Validate error propagation through the faker pipeline

The testing strategy ensures both correctness of individual components and proper integration with the existing
zod-schema-faker v4 architecture.
