# Requirements Document

## Introduction

This specification defines the requirements for implementing Zod v4 intersection schema support in the zod-schema-faker
library. The intersection type combines two schemas where the generated fake data must satisfy both schemas
simultaneously.

## Glossary

- **Intersection_Schema**: A Zod schema created using `z.intersection(left, right)` that combines two schemas
- **Left_Schema**: The first schema in an intersection operation
- **Right_Schema**: The second schema in an intersection operation
- **Fake_Generator**: The v4 function-based system that generates fake data from schemas
- **Schema_Resolver**: The algorithm that determines how to combine intersected schemas
- **Discovery_System**: The property-based testing system that generates random Zod schemas and tests intersection
  support
- **Gap_Analysis**: The process of identifying unsupported intersection combinations by comparing Zod validation with
  faker generation
- **Schema_Generator**: A property-based test generator that creates valid Zod v4 built-in schemas with all their checks
  for intersection testing

## Requirements

### Requirement 1: Basic Intersection Support

**User Story:** As a developer using Zod v4, I want to generate fake data from intersection schemas, so that I can test
code that uses combined schema types.

#### Acceptance Criteria

1. WHEN an intersection schema is provided to the fake generator, THE Fake_Generator SHALL produce data that passes both
   the Left_Schema and Right_Schema parse functions
2. WHEN the intersection of two schemas results in a non-never type, THE Fake_Generator SHALL generate valid data for
   that intersection
3. WHEN the intersection of two schemas results in an impossible combination, THE Fake_Generator SHALL throw a
   descriptive TypeError
4. THE Fake_Generator SHALL integrate seamlessly with the existing v4 function-based architecture

### Requirement 2: Schema Combination Logic

**User Story:** As a developer, I want the intersection resolver to handle all schema type combinations, so that I can
intersect any compatible schemas.

#### Acceptance Criteria

1. WHEN intersecting schemas of the same type, THE Schema_Resolver SHALL merge their constraints appropriately
2. WHEN intersecting schemas of different types, THE Schema_Resolver SHALL find valid combinations where output types
   overlap
3. WHEN intersecting wrapper schemas (optional, nullable, default, etc.), THE Schema_Resolver SHALL handle the wrapper
   logic correctly
4. WHEN intersecting complex schemas (objects, arrays, unions, etc.), THE Schema_Resolver SHALL recursively resolve
   nested intersections

### Requirement 3: Error Handling and Integration

**User Story:** As a developer, I want clear error messages and good performance, so that intersection support is
reliable and efficient.

#### Acceptance Criteria

1. WHEN schemas cannot be intersected, THE Fake_Generator SHALL throw a TypeError with a descriptive message
2. THE Schema_Resolver SHALL avoid infinite recursion when processing self-referential schemas
3. THE Fake_Generator SHALL reuse the existing v4 context system for configuration and random generation
4. THE intersection implementation SHALL follow the same patterns as other v4 schema handlers

### Requirement 4: Intersection Discovery and Gap Analysis

**User Story:** As a library maintainer, I want to systematically discover what Zod intersection combinations are
accepted by Zod but not supported by the faker, so that I can identify and prioritize implementation gaps.

#### Acceptance Criteria

1. WHEN running property-based discovery tests, THE Discovery_System SHALL generate random Zod v4 built-in intersection
   schemas with all their checks that are valid according to Zod's parser
2. WHEN a generated intersection schema is valid in Zod but fails in the faker, THE Discovery_System SHALL capture the
   schema structure and error details for analysis
3. WHEN analyzing discovered gaps, THE Discovery_System SHALL categorize failures by schema type combinations and error
   patterns
4. WHEN reporting discovery results, THE Discovery_System SHALL provide actionable information about which intersection
   types need implementation or fixes
5. THE Discovery_System SHALL use property-based testing to systematically explore the intersection space of all Zod v4
   built-in schema types and their checks rather than relying on manual test cases
