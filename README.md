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
import * as z from 'zod' // or '@zod/mini'
import { fake } from 'zod-schema-faker'

fake(z.string())
```

## About

Distributed under the MIT license. See LICENSE for more information.
