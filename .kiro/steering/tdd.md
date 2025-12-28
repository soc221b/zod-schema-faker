---
inclusion: always
---

# Test-Driven Development Guidelines

## Core TDD Principles

Follow the **Red-Green-Refactor** cycle for all new functionality:

1. **Red**: Write a failing test that describes the desired behavior
2. **Green**: Write the minimal code to make the test pass
3. **Refactor**: Improve code quality while keeping tests green

## Test Requirements

### Coverage Standards

- **100% test coverage** is enforced via Vitest configuration
- All new code must include corresponding tests
- Tests must cover both happy path and edge cases

### Test Structure

- Mirror source directory structure in `tests/` folder
- Use descriptive test names that explain the behavior being tested
- Group related tests using `describe` blocks
- Use `it` or `test` for individual test cases

### Test File Naming

- Match source file names with `.test.ts` suffix
- Example: `src/v3/zod-string-faker.ts` → `tests/v3/zod-string-faker.test.ts`

## Testing Patterns

### For Faker Functions

```typescript
describe('zodStringFaker', () => {
  it('should generate string within length constraints', () => {
    const schema = z.string().min(5).max(10)
    const result = fake(schema)
    expect(result).toHaveLength(expect.any(Number))
    expect(result.length).toBeGreaterThanOrEqual(5)
    expect(result.length).toBeLessThanOrEqual(10)
  })
})
```

### For Schema Validation

- Test that generated data validates against the original schema
- Use `schema.parse(fakeData)` to verify compliance
- Test constraint adherence (min/max, patterns, etc.)

### For Error Handling

- Test unsupported schema types throw appropriate errors
- Verify error messages are descriptive and actionable

## Version-Specific Testing

### v3 Implementation

- Test faker installation and retrieval
- Verify class-based faker system works correctly
- Test custom faker registration

### v4 Implementation

- Test function-based faker system
- Verify context passing and configuration
- Test schema transformation pipeline

## Integration Testing

- Include integration tests in `integration.test.ts`
- Test complete workflows from schema to fake data
- Verify compatibility with different Zod versions

## Test Utilities

- Use shared utilities from `tests/v*/util.ts`
- Create reusable test helpers for common patterns
- Maintain consistent test data and assertions

## Before Committing

Always run the full test suite:

```bash
npm run test
```

Tests must pass with 100% coverage before any code changes are accepted.
