# zod-schema-faker

> Generate mock data from [zod](https://github.com/colinhacks/zod) schemas. Powered by
> [@faker-js/faker](https://github.com/faker-js/faker) and [randexp.js](https://github.com/fent/randexp.js).

[![CI](https://github.com/soc221b/zod-schema-faker/actions/workflows/ci.yml/badge.svg)](https://github.com/soc221b/zod-schema-faker/actions/workflows/ci.yml)
[![NPM](https://img.shields.io/npm/v/zod-schema-faker.svg?label=NPM&color=brightgreen)](https://www.npmjs.com/package/zod-schema-faker)

Features

- Support almost all zod types
- Support for custom zod types
- Extensive tests

## Installation

```sh
npm install --save-dev zod-schema-faker
```

## Usage

Built-in zod types:

```ts
import { z } from 'zod'
import { install, fake } from 'zod-schema-faker'

// define a zod schema
const schema = z.number()

// call install() to register fakers
install()

// generate fake data based on schema
const data = fake(schema)
```

Custom zod types:

```ts
import { z } from 'zod'
import { installCustom, fake, getFaker, ZodTypeFaker } from 'zod-schema-faker'

// define a custom zod schema
const pxSchema = z.custom<`${number}px`>(val => {
  return typeof val === 'string' ? /^\d+px$/.test(val) : false
})

// define a custom faker
class ZodPxFaker extends ZodTypeFaker<typeof pxSchema> {
  fake(): `${number}px` {
    return `${getFaker().number.int({ min: 0 })}px`
  }
}

// call installCustom() to register custom fakers
installCustom(pxSchema, ZodPxFaker)

// generate fake data based on schema
const data = fake(pxSchema)
```

## API

Core APIs

- `function install(): void`: Install fakers for built-in types, must be called before using `fake`.
- `function fake<T extends z.ZodType>(schema: T): z.infer<T>`: Generate fake data based on schema.
- `function seed(value?: number): void`: Sets the seed to use.
- `class ZodSchemaFakerError`

Random Utility APIs

- `function setFaker(faker: Faker): void`: Use given faker instance instead of the default one.
- `function getFaker(): Faker`: Get the faker instance. Defaults to `fakerEN`.
- `function randexp(pattern: string | RegExp, flags?: string): string`: Create random strings that match a given regular
  expression.

Customization APIs - see [example](./tests/zod-custom-faker.test.ts) for details

- `class ZodTypeFaker`: Base class for fakers.
- `function installCustom<T extends z.ZodTypeAny>(schema: T, faker: typeof ZodTypeFakerConcrete<T>): void`: Install
  fakers for custom schemas, must be called before using `fake`.

## Supported Zod Types

- methods
  - ✅ .and
  - ✅ .array
  - ✅ .brand
  - ✅ .catch
  - ✅ .default
  - ✅ .nullable
  - ✅ .nullish
  - ✅ .optional
  - ✅ .or
  - ✅ .pipe
  - ✅ .promise
  - ✅ .readonly
  - ❌ .refine
  - ❌ .superRefine
  - ✅ .transform
- ✅ z.any
- ✅ z.array
- ✅ z.bigint
- ✅ z.boolean
- ✅ z.custom: see [example](./tests/zod-custom-faker.test.ts) for details.
- ✅ z.date
- ✅ z.discriminatedUnion
- ✅ z.enum
- ✅ z.instanceof: see [example](./tests/zod-instanceof-faker.test.ts) for details.
- ✅ z.intersection
- ✅ z.function
- ✅ z.lazy
- ✅ z.literal
- ✅ z.map
- ✅ z.nan
- ✅ z.nativeEnum
- ✅ z.never: always throws an error
- ✅ z.null
- ✅ z.number
- ✅ z.object
- ✅ z.preprocess[^2]
- ✅ z.promise
- ✅ z.record
- ✅ z.set
- ✅ z.string[^1]
- ✅ z.symbol
- ✅ z.tuple
- ✅ z.undefined
- ✅ z.union
- ✅ z.unknown
- ✅ z.void

[^1]: Not compatible with other validations. For example, `z.length(5)` is ignored in `z.base64().length(5)`.

[^2]: Not applicable, ignored

## Comparison

### @anatine/zod-mock

https://github.com/anatine/zod-plugins/tree/main/packages/zod-mock

- Excels at generating realistic data for `z.string`. For instance, `z.object({ image: z.string() })` will produce a URL
  string.
- Lacks support for some basic zod types such as `z.any`, `z.default`, `z.tuple`, etc.

### zod-fixture

https://github.com/timdeschryver/zod-fixture

- Provides support for custom zod types.
- Occasionally generates invalid mocked data. For example, calling with the function generated from
  `z.function(z.tuple([]), z.boolean())` did not return a boolean value.

### Inactive Libraries

- https://github.com/dipasqualew/zod-mocking
- https://github.com/LorisSigrist/zocker
- https://github.com/ItMaga/zodock

## About

Distributed under the MIT license. See LICENSE for more information.
