---
inclusion: always
---

# Acceptance Criteria

## Build Quality Gates

All changes MUST pass these automated checks before being considered complete:

1. **TypeScript Compilation**: `npx tsc` MUST exit with code 0 (no type errors)
2. **Build Process**: `npx vite build` MUST exit with code 0 (successful build)
3. **Code Formatting**: `npx prettier --check .` MUST exit with code 0 (proper formatting)
4. **Test Suite**: `npx vitest run` MUST exit with code 0 (all tests passing)
5. **Test Coverage**: MUST maintain 100% test coverage threshold

## Code Quality Standards

- **Type Safety**: All code MUST be strictly typed with no `any` types unless absolutely necessary
- **Test Coverage**: Every new function, class, or module MUST have corresponding tests
- **Documentation**: Public APIs MUST have JSDoc comments explaining parameters and return values
- **Error Handling**: All error cases MUST be properly handled and tested

## Implementation Requirements

- **Dual Version Support**: Changes affecting core functionality MUST support both Zod v3 and v4
- **Backward Compatibility**: Public API changes MUST maintain backward compatibility
- **Performance**: New implementations SHOULD not significantly degrade performance
- **Memory Usage**: Avoid memory leaks and excessive object creation in hot paths

## Testing Standards

- **Unit Tests**: Each faker implementation MUST have comprehensive unit tests
- **Integration Tests**: Cross-schema interactions MUST be tested
- **Edge Cases**: Boundary conditions and error scenarios MUST be covered
- **Deterministic Tests**: Tests MUST be deterministic and not rely on random behavior
