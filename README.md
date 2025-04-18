# zod-schema-faker

> Generate mock data from [zod](https://github.com/colinhacks/zod) schemas. Powered by
> [@faker-js/faker](https://github.com/faker-js/faker) and [randexp.js](https://github.com/fent/randexp.js).

[![CI](https://github.com/soc221b/zod-schema-faker/actions/workflows/ci.yml/badge.svg)](https://github.com/soc221b/zod-schema-faker/actions/workflows/ci.yml)
[![NPM](https://img.shields.io/npm/v/zod-schema-faker.svg?label=NPM&color=brightgreen)](https://www.npmjs.com/package/zod-schema-faker)

Features

- Support almost all zod types
- Extensive tests

## Installation

```sh
npm install --save-dev zod-schema-faker
```

## Usage

Built-in zod types:

```ts
import * as z from 'zod' // or import * as z from '@zod/mini'
import { faker } from '@faker-js/faker'
import { setFaker, fake, fakeSchema } from 'zod-schema-faker'

const User = z.interface({
  name: z.string(),
  age: z.uint32(),
})

// enable tree shaking
if (process.env.NODE_ENV === 'development') {
  setFaker(faker) // or setFaker(your faker instance)

  const data = fake(z.string())

  console.log(data.name) // { name: 'lorem', age: 42 }
}
```

## Migration from v1(zod@3) to v2(zod@4)

- No need to invoke `install` anymore.
- Need to set the faker instance using `setFaker` before using `fake`.

## About

Distributed under the MIT license. See LICENSE for more information.
