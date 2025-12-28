# Technology Stack

## Core Technologies

- **TypeScript 5.9.3**: Primary language with strict type checking enabled
- **Node.js**: Runtime environment (ES2020 target)
- **Vite 7.3.0**: Build tool and bundler
- **Vitest 4.0.16**: Testing framework with 100% coverage requirement

## Key Dependencies

- **@faker-js/faker 10.1.0**: Core fake data generation
- **randexp 0.5.3**: Regular expression-based string generation
- **zod**: Peer dependency (supports v3.25.0+ and v4.0.0+)

## Build System

### Build Configuration

- Uses Vite with library mode
- Generates multiple entry points: main (v3), v3, and v4
- Outputs ES modules and CommonJS formats
- TypeScript declarations with rollup bundling

### Common Commands

```bash
# Build the library
npm run build

# Run tests with coverage
npm run test

# Format code
npm run format

# Create package for distribution
npm run pack
```

## Code Quality Tools

- **Prettier**: Code formatting with custom configuration
  - Single quotes, no semicolons, 120 character line width
  - Plugins: organize-imports, sort-json, packagejson
- **TypeScript**: Strict mode with comprehensive linting rules
- **Vitest**: 100% test coverage threshold enforced

## Module System

- ES modules by default (`"type": "module"`)
- Dual package exports (ESM/CJS)
- Tree-shakeable with `"sideEffects": false`
