# Project Context

## Purpose

Generate mock data from [Zod](https://github.com/colinhacks/zod) schemas. This library helps developers create realistic
fake data for testing, development, and prototyping by leveraging Zod's type-safe schema definitions. It supports both
Zod v3 and v4, offering extensive coverage of Zod types including custom types.

## Tech Stack

- **TypeScript 5.9.3** - Primary language with strict type checking enabled
- **Zod** (v3 & v4) - Schema validation library that this project generates data for
- **@faker-js/faker 10.1.0** - Realistic fake data generation
- **randexp.js 0.5.3** - Random string generation from regular expressions
- **Vite 7.2.6** - Build tool and bundler
- **Vitest 4.0.15** - Testing framework with coverage
- **Node.js** - Runtime environment (LTS version required)

## Project Conventions

### Code Style

- **Formatter**: Prettier with the following rules:
  - No semicolons (`semi: false`)
  - Single quotes (`singleQuote: true`)
  - 120 character line width (`printWidth: 120`)
  - 2 space indentation (`tabWidth: 2`)
  - Trailing commas everywhere (`trailingComma: 'all'`)
  - Arrow function parentheses avoided when possible (`arrowParens: 'avoid'`)
  - LF line endings (`endOfLine: 'lf'`)
- **Plugins**: prettier-plugin-organize-imports, prettier-plugin-packagejson, prettier-plugin-sort-json
- **TypeScript**: Strict mode enabled with all strict flags (strictNullChecks, strictFunctionTypes, etc.)
- **Naming**: Follow standard TypeScript conventions (PascalCase for classes, camelCase for functions/variables)

### Architecture Patterns

- **Multi-version support**: Separate implementations for Zod v3 (`src/v3/`) and v4 (`src/v4/`)
- **Type-based dispatch**: Each Zod type has a dedicated faker module (e.g., `zod-string-faker.ts`,
  `zod-number-faker.ts`)
- **Factory pattern**: Custom type fakers extend base `ZodTypeFaker` class (v3) or implement `Fake<T>` interface (v4)
- **Extensibility**: Public APIs for registering custom fakers (`installCustom` for v3, `custom` for v4)
- **Modular exports**: Three entry points (`.`, `./v3`, `./v4`) with ESM and CJS support

### Testing Strategy

- **Framework**: Vitest with coverage tracking (@vitest/coverage-v8)
- **Test organization**: Mirrors source structure (`tests/v3/` and `tests/v4/`)
- **Coverage**: Extensive tests for all Zod types and edge cases
- **Integration tests**: Validate behavior across complex schema compositions
- **Test files**: Named with `.test.ts` suffix (e.g., `zod-string-faker.test.ts`)
- **Requirements**: All bug fixes and new features must include tests

### Git Workflow

- **Branching**: All work happens on the `main` branch (no separate development branches)
- **Commits**: Follow [Conventional Commits](https://www.conventionalcommits.org/) via @commitlint/config-conventional
  - Types: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `perf`, `style`, `ci`
  - Scopes: Can include component names (e.g., `fix(intersection)`, `feat(string)`)
  - Format: `<type>(<scope>): <description>`
- **Versioning**: Semantic versioning (semver)
- **Changelog**: All significant changes documented in CHANGELOG.md
- **Pull requests**: Review required before merging; must pass all tests and formatting checks

## Domain Context

- **Zod schemas**: Type-safe schema validation library with chainable API (e.g., `z.string().min(5).max(10)`)
- **Faker data generation**: Creating realistic random data that satisfies schema constraints
- **Schema constraints**: Min/max values, length limits, regex patterns, refinements, transforms, etc.
- **Type intersection**: Combining multiple schemas where conflicts must be resolved (e.g., conflicting min/max values)
- **Custom types**: Users can define custom Zod types with `z.custom()` and register corresponding fakers
- **Depth tracking**: Recursive schemas require depth limits to prevent infinite recursion

## Important Constraints

- **Peer dependency**: Must support both Zod v3.25.0+ and v4.0.0+
- **Type safety**: Generated data must satisfy TypeScript types inferred from schemas
- **No side effects**: Library marked as side-effect-free (`"sideEffects": false`)
- **Bundle formats**: Must provide both ESM and CJS builds
- **Backward compatibility**: Minor versions cannot introduce breaking changes
- **Main branch stability**: `main` must always be in a releasable state with passing tests

## External Dependencies

- **@faker-js/faker**: Core dependency for generating realistic fake data (names, addresses, dates, etc.)
- **randexp**: For generating random strings matching regex patterns (used with Zod string regex constraints)
- **Zod**: Peer dependency - schemas are provided by users, not bundled
- **GitHub Actions**: CI/CD for automated testing and releases
- **npm**: Package distribution via npm registry
