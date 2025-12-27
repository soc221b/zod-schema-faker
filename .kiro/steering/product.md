# Product Overview

zod-schema-faker is a TypeScript library that generates mock data from Zod schemas. It's powered by @faker-js/faker and
randexp.js to create realistic fake data for testing purposes.

## Key Features

- Supports Zod v3, v4, and mini versions
- Comprehensive support for almost all Zod types
- Custom schema support with extensible faker system
- Extensive test coverage (100% threshold)
- Multiple export formats (ES modules, CommonJS)

## Target Users

Developers using Zod for schema validation who need to generate mock data for testing, development, or prototyping.

## Architecture

The library maintains separate implementations for Zod v3 and v4 due to API differences:

- v3: Class-based faker system with installation pattern
- v4: Function-based faker system with direct usage pattern

Both versions provide core functionality for generating fake data while maintaining compatibility with their respective
Zod versions.
