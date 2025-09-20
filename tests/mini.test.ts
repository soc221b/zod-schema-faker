import { faker } from '@faker-js/faker'
import { beforeAll, describe, expect, test } from 'vitest'
import * as z from 'zod/mini'
import { custom, fake, Fake, getFaker, setFaker } from '../src'

const validSuits: { schema: z.ZodMiniType; description?: string; only?: boolean; async?: boolean }[] = [
  // any
  { schema: z.any() },

  // array
  { schema: z.array(z.string()) },
  { schema: z.array(z.string()).check(z.minLength(1)), description: 'min' },
  { schema: z.array(z.string()).check(z.maxLength(10)), description: 'max' },
  { schema: z.array(z.string()).check(z.length(5)), description: 'length' },
  { schema: z.array(z.string()).check(z.minLength(3), z.minLength(1), z.minLength(2)), description: 'min (multiple)' },
  { schema: z.array(z.string()).check(z.maxLength(1), z.maxLength(3), z.maxLength(2)), description: 'max (multiple)' },

  // bigint
  { schema: z.bigint() },
  { schema: z.bigint().check(z.gt(5n)), description: 'gt' },
  { schema: z.bigint().check(z.gte(5n)), description: 'gte' },
  { schema: z.bigint().check(z.lt(5n)), description: 'lt' },
  { schema: z.bigint().check(z.lte(5n)), description: 'lte' },
  { schema: z.bigint().check(z.positive()), description: 'positive' },
  { schema: z.bigint().check(z.nonnegative()), description: 'nonnegative' },
  { schema: z.bigint().check(z.negative()), description: 'negative' },
  { schema: z.bigint().check(z.nonpositive()), description: 'nonpositive' },
  { schema: z.bigint().check(z.multipleOf(5n)), description: 'multipleOf' },
  { schema: z.int64(), description: 'int64' },
  { schema: z.uint64(), description: 'uint64' },
  {
    schema: z.bigint().check(z.minimum(200n), z.minimum(300n), z.minimum(100n), z.maximum(300n)),
    description: 'min (multiple)',
  },
  {
    schema: z.bigint().check(z.maximum(100n), z.maximum(300n), z.maximum(200n), z.minimum(100n)),
    description: 'max (multiple)',
  },
  {
    schema: z.bigint().check(z.multipleOf(2n), z.multipleOf(3n), z.minimum(2n), z.maximum(6n)),
    description: 'multipleOf (multiple)',
  },

  // boolean
  { schema: z.boolean() },

  // brand
  { schema: z.object({ name: z.string() }).brand<'Cat'>() },

  // catch
  { schema: z.catch(z.number(), 42) },
  {
    schema: z.catch(z.number(), ctx => {
      ctx.error // the caught ZodError
      return Math.random()
    }),
    description: 'function',
  },

  // coerce
  { schema: z.coerce.bigint() },
  { schema: z.coerce.boolean() },
  { schema: z.coerce.date() },
  { schema: z.coerce.number() },
  { schema: z.coerce.string() },

  // custom
  {
    schema: (() => {
      const px = z.custom<`${number}px`>(val => {
        return typeof val === 'string' ? /^\d+px$/.test(val) : false
      })
      const fakePx: Fake<any> = () => {
        return getFaker().number.int({ min: 1, max: 100 }) + 'px'
      }
      custom(px, fakePx)
      return px
    })(),
  },

  // date
  { schema: z.date() },
  { schema: z.date().check(z.minimum(new Date('3000-01-01'))), description: 'min' },
  { schema: z.date().check(z.maximum(new Date('1000-01-01'))), description: 'max' },
  {
    schema: z
      .date()
      .check(
        z.minimum(new Date('1111-01-01T00:00:00.000Z')),
        z.minimum(new Date('3333-01-01T00:00:00.000Z')),
        z.minimum(new Date('2222-01-01T00:00:00.000Z')),
        z.maximum(new Date('3333-01-01T00:00:00.000Z')),
      ),
    description: 'multiple min',
  },
  {
    schema: z
      .date()
      .check(
        z.maximum(new Date('2222-01-01T00:00:00.000Z')),
        z.maximum(new Date('1111-01-01T00:00:00.000Z')),
        z.maximum(new Date('3333-01-01T00:00:00.000Z')),
        z.minimum(new Date('1111-01-01T00:00:00.000Z')),
      ),
    description: 'multiple max',
  },

  // default
  { schema: z._default(z.string(), 'tuna') },
  { schema: z._default(z.number(), Math.random), description: 'function' },

  // discriminatedUnion
  {
    schema: z.discriminatedUnion('status', [
      z.object({ status: z.literal('success'), data: z.string() }),
      z.object({ status: z.literal('failed'), error: z.string() }),
    ]),
    description: 'discriminated',
  },
  {
    schema: (() => {
      const BaseError = { status: z.literal('failed'), message: z.string() }
      const MyErrors = z.discriminatedUnion('code', [
        z.object({ ...BaseError, code: z.literal(400) }),
        z.object({ ...BaseError, code: z.literal(401) }),
        z.object({ ...BaseError, code: z.literal(500) }),
      ])
      const MyResult = z.discriminatedUnion('status', [
        z.object({ status: z.literal('success'), data: z.string() }),
        MyErrors,
      ])
      return MyResult
    })(),
    description: 'discriminated nesting',
  },

  // enum
  {
    schema: z.enum([
      'Salmon',
      'Tuna',
      'Trout',
    ]),
    description: 'string',
  },
  {
    schema: (() => {
      enum Fish {
        Salmon = 'Salmon',
        Tuna = 'Tuna',
        Trout = 'Trout',
      }
      return z.enum(Fish)
    })(),
    description: 'enum',
  },
  {
    schema: (() => {
      enum Fish {
        Salmon = 'Salmon',
        Tuna = 'Tuna',
        Trout = 'Trout',
      }
      return z.nativeEnum(Fish)
    })(),
    description: 'nativeEnum (deprecated)',
  },

  // instanceof
  {
    schema: (() => {
      class Test {
        name: string = ''
      }
      const TestSchema = z.instanceof(Test)
      const fakeTest: Fake<typeof TestSchema> = () => {
        return new Test()
      }
      custom(TestSchema, fakeTest)
      return TestSchema
    })(),
  },

  // TODO: intersection
  // { schema: z.intersection(z.union([z.number(), z.string()]), z.union([z.number(), z.boolean()])) },
  // {
  //   schema: (() => {
  //     const Person = z.object({ name: z.string() })
  //     const Employee = z.object({ role: z.string() })
  //     const EmployedPerson = z.intersection(Person, Employee)
  //     return EmployedPerson
  //   })(),
  //   description: 'complex',
  // },

  // json
  { schema: z.json() },

  // lazy
  { schema: z.lazy(() => z.literal('lazy')) },

  // literal
  { schema: z.literal('literal') },
  {
    schema: z.literal([
      'red',
      'green',
      'blue',
    ]),
    description: 'multiple',
  },

  // map
  { schema: z.map(z.string(), z.number()) },

  // nan
  { schema: z.nan() },

  // nonoptional
  { schema: z.nonoptional(z.null()) },

  // null
  { schema: z.null() },

  // nullable
  { schema: z.nullable(z.literal('nullable')) },

  // nullish
  { schema: z.nullish(z.literal('nullish')) },

  // number
  { schema: z.number() },
  { schema: z.number().check(z.int()), description: 'int' },
  { schema: z.number().check(z.gt(5)), description: 'gt' },
  { schema: z.number().check(z.gte(5)), description: 'gte' },
  { schema: z.number().check(z.lt(5)), description: 'lt' },
  { schema: z.number().check(z.lte(5)), description: 'lte' },
  { schema: z.number().check(z.positive()), description: 'positive' },
  { schema: z.number().check(z.nonnegative()), description: 'nonnegative' },
  { schema: z.number().check(z.negative()), description: 'negative' },
  { schema: z.number().check(z.nonpositive()), description: 'nonpositive' },
  { schema: z.number().check(z.multipleOf(5)), description: 'multipleOf' },
  { schema: z.int(), description: 'int (top)' },
  { schema: z.float32(), description: 'float32' },
  { schema: z.float64(), description: 'float64' },
  { schema: z.int32(), description: 'int32' },
  { schema: z.uint32(), description: 'uint32' },
  { schema: z.number().check(z.positive(), z.int(), z.lte(1)), description: 'positive + int' },
  { schema: z.number().check(z.nonpositive(), z.int(), z.gte(0)), description: 'nonpositive + int' },
  { schema: z.number().check(z.negative(), z.int(), z.gte(-1)), description: 'negative + int' },
  { schema: z.number().check(z.nonnegative(), z.int(), z.lte(0)), description: 'nonnegative + int' },
  { schema: z.number().check(z.positive(), z.lte(0.000000000000001)), description: 'positive + float' },
  { schema: z.number().check(z.negative(), z.gte(-0.000000000000001)), description: 'negative + float' },
  { schema: z.number().check(z.multipleOf(0.000001)), description: 'multipleOf small' },
  { schema: z.number().check(z.multipleOf(1_234_567_890)), description: 'multipleOf large' },
  {
    schema: z.number().check(z.int(), z.minimum(5), z.minimum(3), z.minimum(4), z.maximum(5)),
    description: 'min (multiple)',
  },
  {
    schema: z.number().check(z.int(), z.maximum(3), z.maximum(5), z.maximum(4), z.minimum(3)),
    description: 'max (multiple)',
  },
  {
    schema: z.number().check(z.int(), z.multipleOf(2), z.multipleOf(3), z.minimum(2), z.maximum(6)),
    description: 'multipleOf (multiple)',
  },
  { schema: z.number().check(z.multipleOf(7), z.multipleOf(11)), description: 'multipleOf float (multiple)' },

  // object
  { schema: z.object({}) },
  { schema: z.object({ name: z.string(), age: z.number() }), description: 'nesting' },
  {
    schema: (() => {
      const Category = z.object({
        name: z.string(),
        get subcategory() {
          return z.optional(Category)
        },
      })
      return Category
    })(),
    description: 'recursive optional',
  },
  {
    schema: (() => {
      const Category = z.object({
        name: z.string(),
        get subcategories() {
          return z.array(Category)
        },
      })
      return Category
    })(),
    description: 'recursive array',
  },
  {
    schema: (() => {
      const Category = z.object({
        name: z.string(),
        get subcategories() {
          return z.set(Category)
        },
      })
      return Category
    })(),
    description: 'recursive set',
  },
  {
    schema: (() => {
      const User = z.object({
        email: z.email(),
        get posts() {
          return z.array(Post)
        },
      })
      const Post = z.object({
        title: z.string(),
        get author() {
          return User
        },
      })
      return User
    })(),
    description: 'mutually recursive',
  },
  { schema: z.object({ name: z.string(), 'age?': z.number() }), description: 'optional property' },
  {
    schema: z.object({ name: z.string(), 'age?': z._default(z.number(), 18) }),
    description: 'optional property with default',
  },
  { schema: z.object({ name: z.string(), age: z.optional(z.number()) }), description: 'optional value' },
  // TODO:
  // { schema: z.object({ name: z.string(), age: z.number() }).catchall(z.any()), description: 'catchall' },
  { schema: z.strictObject({ name: z.string(), age: z.number() }), description: 'strict' },
  { schema: z.looseObject({ name: z.string(), age: z.number() }), description: 'loose' },
  { schema: z.object() },
  { schema: z.object({ name: z.string(), age: z.number() }), description: 'nesting' },
  {
    schema: (() => {
      interface Category {
        name: string
        subcategory?: Category
      }
      const Category: z.ZodMiniType<Category> = z.object({
        name: z.string(),
        subcategory: z.lazy(() => z.optional(Category)),
      })
      return Category
    })(),
    description: 'recursive optional',
  },
  {
    schema: (() => {
      interface Category {
        name: string
        subcategories: Category[]
      }
      const Category: z.ZodMiniType<Category> = z.object({
        name: z.string(),
        subcategories: z.lazy(() => z.array(Category)),
      })
      return Category
    })(),
    description: 'recursive array',
  },
  {
    schema: (() => {
      interface Category {
        name: string
        subcategories: Set<Category>
      }
      const Category: z.ZodMiniType<Category> = z.object({
        name: z.string(),
        subcategories: z.lazy(() => z.set(Category)),
      })
      return Category
    })(),
    description: 'recursive set',
  },
  {
    schema: (() => {
      interface User {
        email: string
        posts: Post[]
      }
      interface Post {
        title: string
        author: User
      }
      const User: z.ZodMiniType<User> = z.object({
        email: z.string(),
        posts: z.lazy(() => z.array(Post)),
      })
      const Post: z.ZodMiniType<Post> = z.object({
        title: z.string(),
        author: z.lazy(() => User),
      })
      return User
    })(),
    description: 'mutually recursive',
  },
  {
    schema: z.object({ name: z.string(), age: z._default(z.number(), 18) }),
    description: 'optional property with default',
  },
  { schema: z.object({ name: z.string(), age: z.optional(z.number()) }), description: 'optional value' },
  // { schema: z.object({ name: z.string(), age: z.number() }).strict(), description: 'strict (deprecated)' },
  // { schema: z.object({ name: z.string(), age: z.number() }).strip(), description: 'strip (deprecated)' },
  // { schema: z.object({ name: z.string(), age: z.number() }).passthrough(), description: 'passthrough (deprecated)' },
  // { schema: z.object({ name: z.string(), age: z.number() }).catchall(z.any()), description: 'catchall' },
  { schema: z.strictObject({ name: z.string(), age: z.number() }), description: 'strict (top)' },
  { schema: z.looseObject({ name: z.string(), age: z.number() }), description: 'loose (top)' },

  // optional
  { schema: z.optional(z.literal('optional')) },

  // pipe
  {
    schema: z.pipe(
      z.string(),
      z.transform(val => val.length),
    ),
  },

  // partialRecord
  {
    schema: z.partialRecord(
      z.enum([
        'id',
        'name',
        'email',
      ]),
      z.string(),
    ),
    description: 'partial',
  },

  // promise
  { schema: z.promise(z.number()), async: true, description: '(deprecated)' },

  // readonly
  { schema: z.readonly(z.object({ name: z.string() })), description: 'object' },
  { schema: z.readonly(z.array(z.string())), description: 'array' },
  {
    schema: z.readonly(
      z.tuple([
        z.string(),
        z.number(),
      ]),
    ),
    description: 'tuple',
  },
  { schema: z.readonly(z.map(z.string(), z.date())), description: 'map' },
  { schema: z.readonly(z.set(z.string())), description: 'set' },

  // record
  { schema: z.record(z.string(), z.string()) },
  {
    schema: z.record(
      z.union([
        z.string(),
        z.number(),
        z.symbol(),
      ]),
      z.unknown(),
    ),
    description: 'union',
  },
  {
    schema: z.record(
      z.enum([
        'id',
        'name',
        'email',
      ]),
      z.string(),
    ),
    description: 'enum',
  },
  {
    schema: z.record(
      z.literal([
        'id',
        'name',
        'email',
      ]),
      z.string(),
    ),
    description: 'literal',
  },

  // set
  { schema: z.set(z.number()) },
  { schema: z.set(z.number()).check(z.minSize(1)), description: 'min' },
  { schema: z.set(z.number()).check(z.maxSize(10)), description: 'max' },
  { schema: z.set(z.number()).check(z.size(5)), description: 'size' },
  { schema: z.set(z.number()).check(z.minSize(3), z.minSize(1), z.minSize(2)), description: 'min (multiple)' },
  { schema: z.set(z.number()).check(z.maxSize(1), z.maxSize(3), z.maxSize(2)), description: 'max (multiple)' },

  // string
  { schema: z.string() },
  { schema: z.base64(), description: 'base64' },
  { schema: z.base64url(), description: 'base64url' },
  { schema: z.cidrv4(), description: 'cidrv4' },
  { schema: z.cidrv6(), description: 'cidrv6' },
  { schema: z.cuid(), description: 'cuid' },
  { schema: z.cuid2(), description: 'cuid2' },
  { schema: z.e164(), description: 'e164' },
  { schema: z.email(), description: 'email' },
  { schema: z.email({ pattern: z.regexes.html5Email }), description: 'email html5' },
  { schema: z.email({ pattern: z.regexes.browserEmail }), description: 'email browser' },
  { schema: z.email({ pattern: z.regexes.rfc5322Email }), description: 'email rfc5322' },
  { schema: z.email({ pattern: z.regexes.unicodeEmail }), description: 'email unicode' },
  { schema: z.emoji(), description: 'emoji' },
  { schema: z.guid(), description: 'guid' },
  { schema: z.ipv4(), description: 'ipv4' },
  { schema: z.ipv6(), description: 'ipv6' },
  { schema: z.iso.date(), description: 'date' },
  { schema: z.iso.datetime(), description: 'datetime' },
  { schema: z.iso.duration(), description: 'duration' },
  { schema: z.iso.time(), description: 'time' },
  { schema: z.jwt(), description: 'jwt' },
  { schema: z.ksuid(), description: 'ksuid' },
  { schema: z.nanoid(), description: 'naoid' },
  { schema: z.ulid(), description: 'ulid' },
  { schema: z.url(), description: 'url' },
  { schema: z.uuid(), description: 'uuid' },
  { schema: z.xid(), description: 'xid' },
  {
    schema: z.string().check(z.minLength(5), z.minLength(3), z.minLength(4), z.maxLength(5)),
    description: 'min (multiple)',
  },
  {
    schema: z.string().check(z.maxLength(3), z.maxLength(5), z.maxLength(4), z.minLength(3)),
    description: 'max (multiple)',
  },
  { schema: z.string().check(z.length(5), z.minLength(4)), description: 'length + min' },
  { schema: z.string().check(z.length(5), z.maxLength(6)), description: 'length + max' },

  // string bool
  { schema: z.stringbool() },

  // symbol
  { schema: z.symbol() },

  // template literal
  {
    schema: z.templateLiteral([
      'hello, ',
      z.string(),
    ]) as any,
  },
  {
    schema: (() => {
      const cssUnits = z.enum([
        'px',
        'em',
        'rem',
        '%',
      ])
      return z.templateLiteral([
        z.number(),
        cssUnits,
      ]) as any
    })(),
    description: 'enum',
  },
  {
    schema: z.templateLiteral([
      z.string().check(z.minLength(1)),
      '@',
      z.string().check(z.maxLength(64)),
    ]) as any,
    description: 'refinement',
  },

  // TODO: transform
  // { schema: z.transform(val => String(val)) },

  // tuple
  {
    schema: z.tuple([
      z.string(),
      z.number(),
      z.boolean(),
    ]),
  },
  {
    schema: z.tuple(
      [
        z.string(),
      ],
      z.number(),
    ),
    description: 'rest',
  },

  // undefined
  { schema: z.undefined() },

  // union
  {
    schema: z.union([
      z.string(),
      z.number(),
    ]),
  },
  {
    schema: z.union([
      z.string(),
      z.never(),
    ]),
    description: 'never',
  },

  // unknown
  { schema: z.unknown() },

  // void
  { schema: z.void() },
]

const invalidSuits: { schema: z.ZodMiniType; description?: string; only?: boolean; async?: boolean }[] = [
  // array
  { schema: z.array(z.number()).check(z.minLength(6), z.maxLength(4)), description: 'min > max' },
  { schema: z.array(z.number()).check(z.minLength(6), z.length(5)), description: 'min > length' },
  { schema: z.array(z.number()).check(z.maxLength(4), z.length(5)), description: 'max < length' },
  { schema: z.array(z.number()).check(z.length(1), z.length(2)), description: 'length !== length' },

  // bigint
  { schema: z.bigint().check(z.minimum(6n), z.maximum(4n)), description: 'min > max' },
  {
    schema: z.bigint().check(z.minimum(4n), z.maximum(6n), z.multipleOf(7n)),
    description: 'multipleOf is not in range',
  },

  // date
  {
    schema: z
      .date()
      .check(z.minimum(new Date('3333-01-01T00:00:00.000Z')), z.maximum(new Date('2222-01-01T00:00:00.000Z'))),
    description: 'min > max',
  },
  {
    schema: z
      .date()
      .check(z.maximum(new Date('1111-01-01T00:00:00.000Z')), z.minimum(new Date('2222-01-01T00:00:00.000Z'))),
    description: 'max < min',
  },
  {
    schema: z
      .date()
      .check(
        z.minimum(new Date('1111-01-01T00:00:00.000Z')),
        z.minimum(new Date('3333-01-01T00:00:00.000Z')),
        z.minimum(new Date('2222-01-01T00:00:00.000Z')),
        z.maximum(new Date('2222-01-01T00:00:00.000Z')),
      ),
    description: 'multiple min',
  },
  {
    schema: z
      .date()
      .check(
        z.maximum(new Date('2222-01-01T00:00:00.000Z')),
        z.maximum(new Date('1111-01-01T00:00:00.000Z')),
        z.maximum(new Date('3333-01-01T00:00:00.000Z')),
        z.minimum(new Date('2222-01-01T00:00:00.000Z')),
      ),
    description: 'multiple max',
  },

  // never
  { schema: z.never() },
]

beforeAll(() => {
  setFaker(faker)
})

describe('valid', () => {
  validSuits.forEach(({ schema, description, only, async }) => {
    let name = schema._zod.def.type
    if (description) {
      name += ` ${description}`
    }

    const t = only ? test.only : test
    t(name, async () => {
      if (async) {
        const result = fake(schema)
        await schema.parseAsync(result)
      } else {
        expect(() => fake(schema)).not.toThrow()
        const result = fake(schema)
        schema.parse(result)
      }
    })
  })
})

describe('invalid', () => {
  invalidSuits.forEach(({ schema, description, only, async }) => {
    let name = schema._zod.def.type
    if (description) {
      name += ` ${description}`
    }

    const t = only ? test.only : test
    t(name, async () => {
      if (async) {
        await expect(() => fake(schema)).rejects.toThrow()
      } else {
        expect(() => fake(schema)).toThrow()
      }
    })
  })
})
