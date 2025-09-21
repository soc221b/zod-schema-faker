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
npm install --save-dev zod-schema-faker@beta
```

## Usage

Built-in zod types:

```ts
import * as z from 'zod' // or import * as z from 'zod/mini'
import { faker } from '@faker-js/faker'
import { fake, setFaker } from 'zod-schema-faker'

const Player = z.object({
  username: z.string(),
  xp: z.number(),
})

// enable tree shaking
if (process.env.NODE_ENV === 'development') {
  setFaker(faker)
  const data = fake(Player)
  console.log(data) // { username: "billie", xp: 100 }
}
```

Custom zod types:

```ts
import * as z from 'zod' // or import * as z from 'zod/mini'
import { faker } from '@faker-js/faker'
import { custom, fake, Fake, getFaker, setFaker } from 'zod-schema-faker'

const px = z.custom<`${number}px`>(val => {
  return typeof val === 'string' ? /^\d+px$/.test(val) : false
})

const fakePx: Fake<any> = () => {
  return getFaker().number.int({ min: 1, max: 100 }) + 'px'
}
custom(px, fakePx)

setFaker(faker) // or setFaker(your faker instance)
fake(px) // '100px'
```

## Migration from v1(zod@3) to v2(zod@4)

- No need to invoke `install` anymore.
- Need to set the faker instance using `setFaker` before using `fake`.

## API

### Core APIs

- `function fake<T extends core.$ZodType>(schema: T): core.infer<T>`: Generate fake data based on schema.

### Random Utility APIs

- `function seed(value?: number): void`: Sets the seed or generates a new one. This method is intended to allow for
  consistent values in tests, so you might want to use hardcoded values as the seed.
- `function setFaker(faker: Faker): void`: Set the faker instance to use.
- `function getFaker(): Faker`: Get the faker instance.
- `function randexp(pattern: string | RegExp, flags?: string): string`: Create random strings that match a given regular
  expression.

### Customization APIs

- `function custom<T extends core.$ZodType>(schema: T, fake: Fake<T>): void`: Generate fake data based on schema.
- `type Fake<T extends core.$ZodType> = (schema: T, context: Context, rootFake: RootFake) => core.infer<T>`: Custom fake
  function.

## Unsupported

- .file 🚧
- .intersection 🚧
- .refine ❌
- .superRefine ❌

## About

Distributed under the MIT license. See LICENSE for more information.
