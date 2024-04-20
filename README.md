# zod-schema-faker

> Zod-schema-faker will generate you a fake data based on your [zod](https://github.com/colinhacks/zod) schema.

[![zod-schema-faker version](https://img.shields.io/npm/v/zod-schema-faker.svg?label=zod-schema-faker&color=brightgreen)](https://www.npmjs.com/package/zod-schema-faker)

## Installation

```sh
npm install zod
# faker
npm install --save-dev zod-schema-faker
# peer dependencies
npm install --save-dev @faker-js/faker
npm install --save-dev randexp
```

## Usage

```ts
import * as z from 'zod'
import { install, fake } from 'zod-schema-faker'

const schema = z.number()

// enable tree shaking
if (process.env.NODE_ENV === 'development') {
  install()

  const data = fake(schema)

  console.log(data) // => -2556.9
}
```

## API

- `install(): void`: register fakers, must be called before using `fake()`
- `fake<T extends z.ZodType>(schema: T): z.infer<T>`: generate fake data based on schema

  > This function may throw `ZodSchemaFakerError` if a valid value cannot be generated for the Zod schema, or if the
  > schema is not supported.

- `seed(seed?: number | number[]): void`: sets the seed to use.

  ```ts
  import * as z from 'zod'
  import { install, fake, seed } from 'zod-schema-faker'

  install()

  const schema = z.number()

  seed(1)
  console.log(fake(schema)) // => 8399729968525060
  seed(1)
  console.log(fake(schema)) // => 8399729968525060
  console.log(fake(schema)) // => 62.93956000000001
  ```

- `ZodSchemaFakerError`

## Example

<details>
<summary>
Input
</summary>

```ts
const Person = z.object({
  name: z.string(),
})
const Employee = z.object({
  role: z.string(),
})

interface Category {
  name: string
  subcategories: Category[]
}
const category = z.lazy(() =>
  z.object({
    name: z.string(),
    subcategories: z.array(category),
  }),
) as z.ZodType<Category>

const schema = z.object({
  primitives: z.object({
    string: z.string(),
    number: z.number(),
    bigint: z.bigint(),
    boolean: z.boolean(),
    date: z.date(),
  }),
  emptyValues: z.object({
    undefined: z.undefined(),
    null: z.null(),
    // void: z.void(), // should not use its return value
  }),
  any: z.any(),
  unknown: z.unknown(),
  // never: z.never(), // should not use its return value
  literal: z.literal('tuna'),
  strings: z.object({
    max: z.string().max(5),
    min: z.string().min(5),
    length: z.string().length(5),
    email: z.string().email(),
    url: z.string().url(),
    uuid: z.string().uuid(),
    cuid: z.string().cuid(),
    regex: z.string().regex(/hello+ (world|to you)/),
  }),
  numbers: z.object({
    gt: z.number().gt(5),
    gte: z.number().gte(5),
    lt: z.number().lt(5),
    lte: z.number().lte(5),
    int: z.number().int(),
    positive: z.number().positive(),
    nonnegative: z.number().nonnegative(),
    negative: z.number().negative(),
    nonpositive: z.number().nonpositive(),
    // multipleOf: z.number().multipleOf() // not supported
  }),
  nan: z.nan(),
  boolean: z.boolean(),
  date: z.date(),
  enum: z.enum(['Salmon', 'Tuna', 'Trout']),
  nativeEnum: z.nativeEnum({
    Apple: 'apple',
    Banana: 'banana',
    Cantaloupe: 3,
  } as const),
  optional: z.optional(z.string()),
  nullable: z.nullable(z.string()),
  object: z.object({
    name: z.string(),
    age: z.number(),
  }),
  array: z.array(z.string()),
  tuple: z.tuple([
    z.string(),
    z.number(),
    z.object({
      pointsScored: z.number(),
    }),
  ]),
  union: z.union([z.string(), z.number()]),
  discriminatedUnions: z.discriminatedUnion('type', [
    z.object({ type: z.literal('a'), a: z.string() }),
    z.object({ type: z.literal('b'), b: z.string() }),
  ]),
  record: z.record(z.string(), z.number()),
  map: z.map(z.string(), z.number()),
  set: z.set(z.number()),
  intersection: z.intersection(Person, Employee),
  lazy: category,
  promise: z.promise(z.number()),
})
```

</details>

<details>
<summary>
Output
</summary>

```js
const data = {
  primitives: {
    string: 'velit ullam blanditiis minus omnis enim ut repellat neque iure nisi ipsam d',
    number: 235709817303039.3,
    bigint: 4848309999951517n,
    boolean: true,
    date: 2022-04-08T08:31:40.690Z,
  },
  emptyValues: { undefined: undefined, null: null },
  any: undefined,
  unknown: undefined,
  literal: 'tuna',
  strings: {
    max: 'expli',
    min: 'voluptas dolor repellendus recusandae blanditiis deleniti labore ut voluptates ea quas accusantium et reiciendis at et cumque nihil sit tempore molestias quaerat non molestiae ex sit necessitatibus ipsum fuga est repellendus natus est esse cupiditate dolorem numquam voluptate consequatur et non nemo architecto quia et aut maxime voluptates suscipit similique provident id fuga iure debitis magni repudiandae est dolorem illo totam et voluptatem nihil sit molestiae laboriosam aut possimus tempore minus illo illum magni nihil dolores atque quam sint praesentium laborum sed non molestias eius quisquam quibusdam quas est deserunt quis asperiores laborum accusantium illum temporibus id atque tempora minima molestias quaerat sit voluptatem et iure autem neque perferendis sequi totam nesciunt voluptas et qui praesentium aliquid eaque dolorem voluptatem hic dolorem iure in est aut distinctio repudiandae perferendis amet consequatur quibusdam et eos tenetur nesciunt et iusto atque debitis commodi',
    length: 'natus',
    email: 'Macey.Stoltenberg@gmail.com',
    url: 'https://fabulous-straw.name',
    uuid: '76bac9fd-b1b7-49d0-a600-2d4711531986',
    cuid: "c&BL3'_Vrk1G+3G!wwjn3cu*8|b>_Cf{",
    regex: 'hellooooooooooooooooooooooooooooooooooooooooo world'
  },
  numbers: {
    gt: 5328.419054,
    gte: 36.218591,
    lt: -1628167036925.9614,
    lte: -27882354.519148372,
    int: 16636929,
    positive: 531694153629695.06,
    nonnegative: 579.4830352,
    negative: -38.025,
    nonpositive: -1725.5520665581
  },
  nan: NaN,
  boolean: false,
  date: 2022-04-08T08:31:40.697Z,
  enum: 'Salmon',
  nativeEnum: 3,
  optional: 'elige',
  nullable: null,
  object: {
    name: 'voluptas assumenda odit eveniet cum aut ut doloremque iusto animi modi et q',
    age: -44363342.91183093
  },
  array: [],
  tuple: [ 'quide', 421341404834213.9, { pointsScored: 15651503922295.52 } ],
  union: -1965623492324.935,
  discriminatedUnions: { type: 'b', b: 'unde ' },
  record: {
    'aperiam et sit dolor et in ratione aut qui et sequi quisquam culpa quia exercitationem quas commodi sit amet sequi ipsum voluptas qui consectetur optio odio iusto et corrupti modi corrupti quasi sunt id ut cumque ut hic tempora ut accusamus doloremque est aut commodi delectus excepturi accusantium ut quam est asperiores aspernatur fuga hic dolor alias autem quaerat dolores laborum aut dicta consequuntur natus provident rerum asperiores ipsam sint perspiciatis quia quia praesentium quia placeat voluptatem magnam necessitatibus impedit commodi nulla voluptatum cupiditate quasi optio velit numquam beatae et quaerat in odit officia porro rem illum blanditiis est rerum unde exercitationem dolores ut ut aliquid quidem laborum iste suscipit saepe temporibus rerum facere eum culpa laborum ducimus ipsa sequi voluptas est qui molestiae occaecati vel est quia consequatur rerum ad veniam corrupti exercitationem eius libero ea temporibus aut occaecati qui eaque facere ipsam sint expedita ut aut tem': 123095259.95589001
  },
  map: Map(1) { 'vel e' => 2732936928215370 },
  set: Set(1) { 25431.81674167793 },
  intersection: {
    name: 'earum consequatur sit maiores eius hic autem blanditiis aut ut dolore iusto',
    role: 'quis eaque maxime ipsum aut tempore id repellendus sint velit voluptate tempora aut pariatur quasi unde aut optio deleniti optio voluptas est laboriosam quasi aut debitis reprehenderit quia voluptas sit vel sit maiores voluptas vitae culpa commodi aperiam voluptatem modi quia iusto maiores odit quod vel sunt magnam voluptatum eius maiores maxime numquam consequatur hic hic autem accusantium eum veritatis rem quia omnis voluptatibus libero qui harum eum labore molestiae molestias doloribus dolorem mollitia sunt minima consequatur veritatis animi enim neque aut velit nostrum vel ut esse at error illum error eveniet omnis sed et consequatur autem omnis quam esse eum qui tenetur aliquid harum dolorum sit et voluptatem recusandae quo provident dolorum earum doloremque voluptatem dolor quis in minima sint accusantium sequi optio culpa iste minima in officia illum ut optio sapiente expedita facilis aut sunt perspiciatis non modi aut molestiae quo molestiae nemo architecto pariatur doloribus s'
  },
  lazy: {
    name: 'provident omnis ut ex blanditiis aut et minima nobis enim qui et placeat es',
    subcategories: [ [Object], [Object] ]
  },
  promise: Promise { -37512948614638.48 }
}
```

</details>

## Supported APIs

- ✅ z.any
- ✅ z.array
- z.bigint
  - ❌ gt: not yet supported
  - ❌ gte: not yet supported
  - ❌ lt: not yet supported
  - ❌ lte: not yet supported
  - ❌ positive: not yet supported
  - ❌ nonnegative: not yet supported
  - ❌ negative: not yet supported
  - ❌ nonpositive: not yet supported
  - ❌ multipleOf: not yet supported
- ✅ z.boolean
- z.date
  - ✅ min
  - ✅ max
- ✅ z.default
- ✅ z.discriminatedUnion
- z.effects
  - ❌ preprocess: not applicable.
  - ❌ refine: not yet supported.
  - ✅ transform: works as expected.
- ✅ z.enum
- ❌ z.function: not applicable.
- ✅ z.intersection
- ✅ z.lazy
- ✅ z.literal
- ✅ z.map
- ✅ z.nan
- ✅ z.nativeEnum
  - ✅ numeric enums
  - ✅ string enums
  - ✅ const enums
- ✅ z.never: return nothing, should not be used.
- ✅ z.null
- ✅ z.nullable
- z.number
  - ✅ gt
  - ✅ gte
  - ✅ lt
  - ✅ lte
  - ✅ int
  - ✅ positive
  - ✅ nonnegative
  - ✅ negative
  - ✅ nonpositive
  - ✅ multipleOf
  - ✅ finite
  - ✅ safe
- ✅ z.object
- ✅ z.optional
- ✅ z.promise
- ✅ z.record
- ✅ z.set
- z.string
  - ✅ max
  - ✅ min
  - ✅ length
  - ✅ email
  - ✅ url
  - ❌ emoji: not yet supported.
  - ✅ uuid
  - ~~nanoid~~
  - ✅ cuid
  - ✅ cuid2
  - ✅ ulid
  - ✅ regex
  - ✅ includes
  - ✅ startsWith
  - ✅ endsWith
  - ✅ datetime
  - ~~date~~
  - ~~time~~
  - ~~duration~~
  - ✅ ip
  - ~~base64~~
  - ✅ trim
  - ✅ toLowerCase
  - ✅ toUpperCase
- ✅ z.tuple
- ✅ z.undefined
- ✅ z.union
- ✅ z.unknown: return `fake(z.any())`, should not be used.
- ✅ z.void: return `fake(z.any())`, should not be used.

## About

Distributed under the MIT license. See LICENSE for more information.
