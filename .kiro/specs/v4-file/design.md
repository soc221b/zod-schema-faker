# Design Document: Zod v4 File Schema Faker

## Overview

This design implements fake data generation for Zod v4 file schema types in the zod-schema-faker library. The
implementation follows the established v4 architecture pattern with a dedicated `fakeFile` function that integrates
seamlessly with the existing faker system.

File schemas in Zod v4 represent File objects (typically from browser file inputs or Node.js file handling). The faker
generates realistic mock File instances with appropriate constraints for size, MIME type, and content, enabling
comprehensive testing of file handling functionality.

## Architecture

### Integration with Existing v4 System

The file faker follows the established v4 pattern:

```typescript
// In src/v4/internals/fake.ts
case 'file':
  return fakeFile(schema as any, context, rootFake)
```

The implementation leverages:

- **Context**: Tracks recursion depth for nested structures
- **RootFake**: Enables recursive fake data generation
- **getFaker()**: Accesses the configured @faker-js/faker instance
- **Check Processing**: Handles Zod v4 constraint validation patterns

### File Generation Strategy

The faker generates File objects using the browser File constructor or Node.js equivalent, with three main components:

1. **Content Generation**: Creates realistic file content based on MIME type
2. **Metadata Generation**: Produces appropriate filename, size, and timestamps
3. **Constraint Validation**: Ensures generated files meet schema requirements

## Components and Interfaces

### Core File Faker Function

```typescript
export function fakeFile<T extends core.$ZodFile>(schema: T, context: Context, rootFake: typeof internalFake): Infer<T>
```

**Function Signature**: Follows the established v4 pattern with generic type parameter, context, and rootFake callback.

**Return Type**: Uses `Infer<T>` to maintain type safety with the input schema.

### Constraint Processing System

The implementation processes Zod v4 checks to extract file constraints:

```typescript
interface FileConstraints {
  minSize?: number
  maxSize?: number
  exactSize?: number
  allowedMimeTypes?: string[]
}
```

**Check Types Handled**:

- `min_size`: Minimum file size in bytes
- `max_size`: Maximum file size in bytes
- `size_equals`: Exact file size requirement
- `mime_type`: Allowed MIME type patterns

### Content Generation Strategy

**MIME Type-Based Content**:

- **Text types** (`text/*`): Generate lorem ipsum or structured text
- **Image types** (`image/*`): Create minimal binary data representing image headers
- **Application types** (`application/json`, `application/xml`): Generate structured data
- **Default**: Random binary content for unknown types

**Size Management**:

- Generate content to meet size constraints exactly
- Pad or truncate content as needed while maintaining validity
- Handle edge cases (zero size, very large files)

## Data Models

### File Object Structure

```typescript
interface GeneratedFile extends File {
  name: string // Generated filename with appropriate extension
  size: number // Actual file size in bytes
  type: string // MIME type matching constraints
  lastModified: number // Realistic timestamp
}
```

### MIME Type Mapping

```typescript
const MIME_EXTENSIONS: Record<string, string[]> = {
  'text/plain': ['txt'],
  'text/html': ['html', 'htm'],
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'application/json': ['json'],
  'application/pdf': ['pdf'],
  // ... comprehensive mapping
}
```

### Content Generators

```typescript
interface ContentGenerator {
  generateContent(mimeType: string, targetSize: number): ArrayBuffer
  getExtension(mimeType: string): string
  generateFilename(extension: string): string
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a
formal statement about what the system should do. Properties serve as the bridge between human-readable specifications
and machine-verifiable correctness guarantees._

### Property 1: File Object Generation

_For any_ Zod file schema, the faker should generate a valid File object with appropriate name, size, type, and
lastModified properties. **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**

### Property 2: Size Constraint Compliance

_For any_ file schema with size constraints (min, max, or exact), the generated file size should fall within the
specified bounds. **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

### Property 3: MIME Type Constraint Compliance

_For any_ file schema with MIME type constraints, the generated file should have a type matching the allowed patterns
and appropriate file extension. **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

### Property 4: Architecture Integration

_For any_ file schema processed through the v4 faker system, the file faker should integrate seamlessly with existing
Context, RootFake, and type inference patterns. **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**

### Property 5: Error Resilience

_For any_ file schema with invalid or conflicting constraints, the faker should handle them gracefully and produce valid
File objects with reasonable defaults. **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

## Error Handling

### Constraint Validation

**Invalid Size Constraints**:

- Negative values → Default to reasonable minimums (0 bytes)
- Min > Max conflicts → Use min as exact size, log warning
- Extremely large sizes → Cap at reasonable maximum (100MB default)

**MIME Type Handling**:

- Unknown MIME types → Fall back to `application/octet-stream`
- Invalid patterns → Generate common file types (text/plain, image/jpeg)
- Empty constraint lists → Use default MIME type selection
- Multiple allowed MIME types → Randomly select from valid options

### File Generation Failures

**Content Generation Issues**:

- Memory constraints for large files → Use streaming/chunked generation
- Invalid MIME type content → Fall back to generic binary content
- Size calculation errors → Regenerate with adjusted parameters
- Null/undefined prevention → Always return valid File objects with fallback values

**Platform Compatibility**:

- Node.js vs Browser File constructor differences → Detect environment and use appropriate implementation
- Missing File API → Provide polyfill or mock implementation

### Error Messaging

**Meaningful Error Messages**:

- Constraint violation errors → Include specific constraint details and suggested fixes
- Unsupported schema errors → Clearly indicate what is not supported and alternatives
- Configuration errors → Provide actionable guidance for resolution
- Debug information → Include schema details and generation context when errors occur

## Testing Strategy

### Unit Testing Approach

**Specific Examples**:

- Test generation of common file types (text, image, JSON)
- Verify constraint handling for typical size ranges
- Test edge cases (empty files, maximum sizes)
- Validate MIME type and extension matching

**Integration Testing**:

- Test integration with existing v4 faker infrastructure
- Verify Context and RootFake parameter handling
- Test type inference and TypeScript compatibility

### Property-Based Testing Configuration

**Framework**: Vitest with fast-check for property-based testing **Test Configuration**: Minimum 100 iterations per
property test **Coverage Requirement**: 100% line coverage as per project standards

**Property Test Implementation**:

- Generate random file schemas with various constraint combinations
- Verify all generated files meet their schema requirements
- Test constraint boundary conditions and edge cases
- Validate integration with broader schema structures

**Test Tags**: Each property test tagged with:

```typescript
// Feature: v4-file, Property 1: File Object Generation
```

### Mock and Fixture Strategy

**File Content Fixtures**:

- Predefined content samples for each MIME type
- Size-specific test cases (empty, small, medium, large)
- Binary and text content examples

**Schema Fixtures**:

- Common file schema patterns
- Edge case constraint combinations
- Integration test schemas with nested file types

## Implementation Notes

### Performance Considerations

**Memory Efficiency**:

- Generate large file content lazily or in chunks
- Avoid loading entire file content into memory for size-only validation
- Use efficient binary data generation for non-text types

**Generation Speed**:

- Cache MIME type mappings and content generators
- Optimize constraint processing for common patterns
- Minimize faker instance calls for better performance

### Browser vs Node.js Compatibility

**File Constructor Differences**:

- Browser: `new File(bits, name, options)`
- Node.js: May require polyfill or alternative implementation
- Solution: Environment detection with appropriate constructor selection

**Content Generation**:

- Browser: Use Blob and ArrayBuffer APIs
- Node.js: Use Buffer and stream APIs where appropriate
- Unified interface through abstraction layer

### Future Extensibility

**Custom Content Generators**:

- Plugin system for specialized MIME type handling
- User-defined content generation strategies
- Integration with external file generation libraries

**Advanced Constraints**:

- File metadata constraints (creation date, permissions)
- Content validation beyond size and type
- Multi-file relationship constraints (archives, related files)
