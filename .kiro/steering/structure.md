# Project Structure

## Root Directory Organization

```
├── src/                    # Source code
│   ├── v3/                # Zod v3 implementation
│   └── v4/                # Zod v4 implementation
├── tests/                 # Test files (mirrors src structure)
│   ├── v3/                # Tests for v3 implementation
│   └── v4/                # Tests for v4 implementation
├── examples/              # Usage examples
│   ├── v3/                # v3 example project
│   └── v4/                # v4 example project
├── e2e/                   # End-to-end tests
├── dist/                  # Build output (generated)
└── openspec/              # OpenAPI specifications
```

## Source Code Architecture

### v3 Implementation (`src/v3/`)

- **index.ts**: Main exports
- **fake.ts**: Core fake data generation
- **installation.ts**: Faker installation system
- **random.ts**: Random utilities and faker management
- **zod-\*-faker.ts**: Individual Zod type implementations
- **error.ts**: Custom error classes
- **utils.ts**: Shared utilities

### v4 Implementation (`src/v4/`)

- **index.ts**: Main exports
- **fake.ts**: Core fake data generation
- **internals/**: Internal implementation details
  - **schemas/**: Individual schema type handlers
  - **config.ts**: Configuration management
  - **context.ts**: Execution context
  - **random.ts**: Random utilities

## Naming Conventions

- **Files**: kebab-case (e.g., `zod-string-faker.ts`)
- **Classes**: PascalCase (e.g., `ZodTypeFaker`)
- **Functions**: camelCase (e.g., `fake`, `getFaker`)
- **Test files**: Match source file names with `.test.ts` suffix

## Test Structure

Tests mirror the source structure exactly:

- Each source file has a corresponding test file
- Integration tests in `integration.test.ts`
- Utility functions in `util.ts`
- 100% coverage requirement enforced

## Build Outputs

The build process generates:

- `dist/zod-schema-faker.*`: Main entry (v3)
- `dist/v3/zod-schema-faker.*`: v3 specific build
- `dist/v4/zod-schema-faker.*`: v4 specific build
- Multiple formats: `.es.js`, `.cjs`, `.d.ts`
