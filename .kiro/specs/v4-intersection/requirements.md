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
- **Context**: The execution context passed through the v4 faker system

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
