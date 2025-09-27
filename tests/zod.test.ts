import { faker } from '@faker-js/faker'
import { beforeAll, describe, expect, test } from 'vitest'
import * as z from 'zod'
import { custom, fake, Fake, getFaker, setFaker } from '../src'

const validSuits: { schema: z.ZodType; description?: string; only?: boolean; async?: boolean }[] = [
  // any
  { schema: z.any() },

  // array
  { schema: z.array(z.string()) },
  { schema: z.array(z.string()).min(1), description: 'min' },
  { schema: z.array(z.string()).max(10), description: 'max' },
  { schema: z.array(z.string()).length(5), description: 'length' },
  { schema: z.array(z.string()).nonempty(), description: 'nonempty' },
  { schema: z.array(z.string()).min(3).min(1).min(2), description: 'min (multiple)' },
  { schema: z.array(z.string()).max(1).max(3).max(2), description: 'max (multiple)' },

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
  { schema: z.bigint().min(200n).min(300n).min(100n).max(300n), description: 'min (multiple)' },
  { schema: z.bigint().max(100n).max(300n).max(200n).min(100n), description: 'max (multiple)' },
  { schema: z.bigint().multipleOf(2n).multipleOf(3n).min(2n).max(6n), description: 'multipleOf (multiple)' },

  // boolean
  { schema: z.boolean() },

  // brand
  { schema: z.object({ name: z.string() }).brand<'Cat'>() },

  // catch
  { schema: z.number().catch(42) },
  {
    schema: z.number().catch(ctx => {
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
  { schema: z.date().min(new Date('3000-01-01')), description: 'min' },
  { schema: z.date().max(new Date('1000-01-01')), description: 'max' },
  {
    schema: z
      .date()
      .min(new Date('1111-01-01T00:00:00.000Z'))
      .min(new Date('3333-01-01T00:00:00.000Z'))
      .min(new Date('2222-01-01T00:00:00.000Z'))
      .max(new Date('3333-01-01T00:00:00.000Z')),
    description: 'multiple min',
  },
  {
    schema: z
      .date()
      .max(new Date('2222-01-01T00:00:00.000Z'))
      .max(new Date('1111-01-01T00:00:00.000Z'))
      .max(new Date('3333-01-01T00:00:00.000Z'))
      .min(new Date('1111-01-01T00:00:00.000Z')),
    description: 'multiple max',
  },

  // default
  { schema: z.string().default('tuna') },
  { schema: z.number().default(Math.random), description: 'function' },

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

  // function
  {
    schema: z.function({
      input: [
        z.string(),
      ],
      output: z.number(),
    }),
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
  { schema: z.null().nonoptional() },

  // null
  { schema: z.null() },

  // nullable
  { schema: z.nullable(z.literal('nullable')) },

  // nullish
  { schema: z.nullish(z.literal('nullish')) },

  // number
  { schema: z.number() },
  { schema: z.number().int(), description: 'int' },
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
  { schema: z.number().positive().int().lte(1), description: 'positive + int' },
  { schema: z.number().nonpositive().int().gte(0), description: 'nonpositive + int' },
  { schema: z.number().negative().int().gte(-1), description: 'negative + int' },
  { schema: z.number().nonnegative().int().lte(0), description: 'nonnegative + int' },
  { schema: z.number().positive().lte(0.000000000000001), description: 'positive + float' },
  { schema: z.number().negative().gte(-0.000000000000001), description: 'negative + float' },
  { schema: z.number().multipleOf(0.000001), description: 'multipleOf small' },
  { schema: z.number().multipleOf(1_234_567_890), description: 'multipleOf large' },
  { schema: z.number().int().min(5).min(3).min(4).max(5), description: 'min (multiple)' },
  { schema: z.number().int().max(3).max(5).max(4).min(3), description: 'max (multiple)' },
  { schema: z.number().int().multipleOf(2).multipleOf(3).min(2).max(6), description: 'multipleOf (multiple)' },
  { schema: z.number().multipleOf(7).multipleOf(11), description: 'multipleOf float (multiple)' },

  // object
  { schema: z.object({}) },
  { schema: z.object({ name: z.string(), age: z.number() }), description: 'nesting' },
  {
    schema: (() => {
      const Category = z.object({
        name: z.string(),
        get subcategory() {
          return Category.optional()
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
        email: z.email({ pattern: z.core.regexes.idnEmail }),
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
    schema: z.object({ name: z.string(), 'age?': z.number().default(18) }),
    description: 'optional property with default',
  },
  { schema: z.object({ name: z.string(), age: z.number().optional() }), description: 'optional value' },
  { schema: z.object({ name: z.string(), age: z.number() }).catchall(z.any()), description: 'catchall' },
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
      const Category: z.ZodType<Category> = z.object({
        name: z.string(),
        subcategory: z.lazy(() => Category.optional()),
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
      const Category: z.ZodType<Category> = z.object({
        name: z.string(),
        subcategories: z.lazy(() => Category.array()),
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
      const Category: z.ZodType<Category> = z.object({
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
      const User: z.ZodType<User> = z.object({
        email: z.string(),
        posts: z.lazy(() => Post.array()),
      })
      const Post: z.ZodType<Post> = z.object({
        title: z.string(),
        author: z.lazy(() => User),
      })
      return User
    })(),
    description: 'mutually recursive',
  },
  {
    schema: z.object({ name: z.string(), age: z.number().default(18) }),
    description: 'optional property with default',
  },
  { schema: z.object({ name: z.string(), age: z.number().optional() }), description: 'optional value' },
  { schema: z.object({ name: z.string(), age: z.number() }).strict(), description: 'strict (deprecated)' },
  { schema: z.object({ name: z.string(), age: z.number() }).strip(), description: 'strip (deprecated)' },
  { schema: z.object({ name: z.string(), age: z.number() }).passthrough(), description: 'passthrough (deprecated)' },
  { schema: z.object({ name: z.string(), age: z.number() }).catchall(z.any()), description: 'catchall' },
  { schema: z.object({ name: z.string(), age: z.number() }).strict(), description: 'strict' },
  { schema: z.strictObject({ name: z.string(), age: z.number() }), description: 'strict (top)' },
  { schema: z.object({ name: z.string(), age: z.number() }).loose(), description: 'loose' },
  { schema: z.looseObject({ name: z.string(), age: z.number() }), description: 'loose (top)' },

  // optional
  { schema: z.optional(z.literal('optional')) },

  // pipe
  { schema: z.string().pipe(z.transform(val => val.length)) },

  // prefault
  {
    schema: z
      .string()
      .transform(val => val.length)
      .prefault('tuna'),
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
  { schema: z.object({ name: z.string() }).readonly(), description: 'object' },
  { schema: z.array(z.string()).readonly(), description: 'array' },
  {
    schema: z
      .tuple([
        z.string(),
        z.number(),
      ])
      .readonly(),
    description: 'tuple',
  },
  { schema: z.map(z.string(), z.date()).readonly(), description: 'map' },
  { schema: z.set(z.string()).readonly(), description: 'set' },

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
  { schema: z.set(z.number()).min(1), description: 'min' },
  { schema: z.set(z.number()).max(10), description: 'max' },
  { schema: z.set(z.number()).size(5), description: 'size' },
  { schema: z.set(z.number()).min(3).min(1).min(2), description: 'min (multiple)' },
  { schema: z.set(z.number()).max(1).max(3).max(2), description: 'max (multiple)' },

  // string
  { schema: z.string() },
  { schema: z.string().min(1), description: 'min' },
  { schema: z.string().max(10), description: 'max' },
  { schema: z.string().length(5), description: 'length' },
  { schema: z.string().regex(/regex/), description: 'regex' },
  { schema: z.string().startsWith('start'), description: 'startsWith' },
  { schema: z.string().endsWith('end'), description: 'endsWith' },
  { schema: z.string().includes('includes'), description: 'includes' },
  { schema: z.string().uppercase(), description: 'uppercase' },
  { schema: z.string().lowercase(), description: 'lowercase' },
  { schema: z.string().trim(), description: 'trim' },
  { schema: z.string().toUpperCase(), description: 'toUpperCaae' },
  { schema: z.string().toLowerCase(), description: 'toLowerCase' },
  { schema: z.string().base64(), description: 'base64 (deprecated)' },
  { schema: z.string().base64url(), description: 'base64url (deprecated)' },
  { schema: z.string().cidrv4(), description: 'cidrv4 (deprecated)' },
  { schema: z.string().cidrv6(), description: 'cidrv6 (deprecated)' },
  { schema: z.string().cuid(), description: 'cuid (deprecated)' },
  { schema: z.string().cuid2(), description: 'cuid2 (deprecated)' },
  { schema: z.string().date(), description: 'date (deprecated)' },
  { schema: z.string().datetime(), description: 'datetime (deprecated)' },
  { schema: z.string().duration(), description: 'duration (deprecated)' },
  { schema: z.string().e164(), description: 'e164 (deprecated)' },
  { schema: z.string().email(), description: 'email (deprecated)' },
  { schema: z.string().emoji(), description: 'emoji (deprecated)' },
  { schema: z.string().guid(), description: 'guid (deprecated)' },
  { schema: z.string().ipv4(), description: 'ipv4 (deprecated)' },
  { schema: z.string().ipv6(), description: 'ipv6 (deprecated)' },
  { schema: z.string().jwt(), description: 'jwt (deprecated)' },
  { schema: z.string().ksuid(), description: 'ksuid (deprecated)' },
  { schema: z.string().nanoid(), description: 'naoid (deprecated)' },
  { schema: z.string().time(), description: 'time (deprecated)' },
  { schema: z.string().ulid(), description: 'ulid (deprecated)' },
  { schema: z.string().url(), description: 'url (deprecated)' },
  { schema: z.string().uuid(), description: 'uuid (deprecated)' },
  { schema: z.string().xid(), description: 'xid (deprecated)' },
  { schema: z.base64(), description: 'base64' },
  { schema: z.base64url(), description: 'base64url' },
  { schema: z.cidrv4(), description: 'cidrv4' },
  { schema: z.cidrv6(), description: 'cidrv6' },
  { schema: z.cuid(), description: 'cuid' },
  { schema: z.cuid2(), description: 'cuid2' },
  { schema: z.e164(), description: 'e164' },
  { schema: z.email(), description: 'email' },
  { schema: z.email({ pattern: z.regexes.browserEmail }), description: 'email browser' },
  { schema: z.email({ pattern: z.regexes.email }), description: 'email email' },
  { schema: z.email({ pattern: z.regexes.idnEmail }), description: 'email idnEmail' },
  { schema: z.email({ pattern: z.regexes.html5Email }), description: 'email html5' },
  { schema: z.email({ pattern: z.regexes.rfc5322Email }), description: 'email rfc5322' },
  { schema: z.email({ pattern: z.regexes.unicodeEmail }), description: 'email unicode' },
  { schema: z.emoji(), description: 'emoji' },
  { schema: z.guid(), description: 'guid' },
  { schema: z.hash('md5'), description: 'hash md5' },
  { schema: z.hash('md5', { enc: 'hex' }), description: 'hash md5 hex' },
  { schema: z.hash('md5', { enc: 'base64' }), description: 'hash md5 base64' },
  { schema: z.hash('md5', { enc: 'base64url' }), description: 'hash md5 base64url' },
  { schema: z.hash('sha1'), description: 'hash sha1' },
  { schema: z.hash('sha1', { enc: 'hex' }), description: 'hash sha1 hex' },
  { schema: z.hash('sha1', { enc: 'base64' }), description: 'hash sha1 base64' },
  { schema: z.hash('sha1', { enc: 'base64url' }), description: 'hash sha1 base64url' },
  { schema: z.hash('sha256'), description: 'hash sha256' },
  { schema: z.hash('sha256', { enc: 'hex' }), description: 'hash sha256 hex' },
  { schema: z.hash('sha256', { enc: 'base64' }), description: 'hash sha256 base64' },
  { schema: z.hash('sha256', { enc: 'base64url' }), description: 'hash sha256 base64url' },
  { schema: z.hash('sha384'), description: 'hash sha384' },
  { schema: z.hash('sha384', { enc: 'hex' }), description: 'hash sha384 hex' },
  { schema: z.hash('sha384', { enc: 'base64' }), description: 'hash sha384 base64' },
  { schema: z.hash('sha384', { enc: 'base64url' }), description: 'hash sha384 base64url' },
  { schema: z.hash('sha512'), description: 'hash sha512' },
  { schema: z.hash('sha512', { enc: 'hex' }), description: 'hash sha512 hex' },
  { schema: z.hash('sha512', { enc: 'base64' }), description: 'hash sha512 base64' },
  { schema: z.hash('sha512', { enc: 'base64url' }), description: 'hash sha512 base64url' },
  { schema: z.hex(), description: 'hex' },
  { schema: z.hostname(), description: 'hostname' },
  { schema: z.httpUrl(), description: 'httpUrl' },
  { schema: z.ipv4(), description: 'ipv4' },
  { schema: z.ipv6(), description: 'ipv6' },
  { schema: z.iso.date(), description: 'date' },
  { schema: z.iso.datetime(), description: 'datetime' },
  { schema: z.iso.datetime({ local: true }), description: 'datetime local' },
  { schema: z.iso.datetime({ offset: true }), description: 'datetime offset' },
  { schema: z.iso.datetime({ precision: 3 }), description: 'datetime precision' },
  { schema: z.iso.duration(), description: 'duration' },
  { schema: z.iso.time(), description: 'time' },
  { schema: z.iso.time({ precision: 9 }), description: 'time precision' },
  { schema: z.jwt(), description: 'jwt' },
  { schema: z.jwt({ alg: 'HS256' }), description: 'jwt alg' },
  { schema: z.ksuid(), description: 'ksuid' },
  { schema: z.nanoid(), description: 'naoid' },
  { schema: z.ulid(), description: 'ulid' },
  { schema: z.url(), description: 'url' },
  { schema: z.url({ hostname: /^example\.com$/ }), description: 'url hostname' },
  { schema: z.url({ protocol: /^https$/ }), description: 'url protocol' },
  {
    schema: z.url({
      protocol: /^https?$/,
      hostname: z.regexes.domain,
    }),
    description: 'url protocol hostname',
  },
  { schema: z.uuid(), description: 'uuid' },
  { schema: z.uuid({ version: 'v1' }), description: 'uuid v1' },
  { schema: z.uuid({ version: 'v2' }), description: 'uuid v2' },
  { schema: z.uuid({ version: 'v3' }), description: 'uuid v3' },
  { schema: z.uuid({ version: 'v4' }), description: 'uuid v4' },
  { schema: z.uuid({ version: 'v5' }), description: 'uuid v5' },
  { schema: z.uuid({ version: 'v6' }), description: 'uuid v6' },
  { schema: z.uuid({ version: 'v7' }), description: 'uuid v7' },
  { schema: z.uuid({ version: 'v8' }), description: 'uuid v8' },
  { schema: z.uuidv4(), description: 'uuidv4' },
  { schema: z.uuidv6(), description: 'uuidv6' },
  { schema: z.uuidv7(), description: 'uuidv7' },
  { schema: z.xid(), description: 'xid' },
  { schema: z.string().min(5).min(3).min(4).max(5), description: 'min (multiple)' },
  { schema: z.string().max(3).max(5).max(4).min(3), description: 'max (multiple)' },
  { schema: z.string().length(5).min(4), description: 'length + min' },
  { schema: z.string().length(5).max(6), description: 'length + max' },

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
      z.string().min(1),
      '@',
      z.string().max(64),
    ]) as any,
    description: 'refinement',
  },
  {
    schema: z.templateLiteral([
      z.literal('grassy').nullable(),
    ]),
    description: 'nullable',
  },

  // TODO: transform
  {
    schema: z.string().pipe(z.transform(val => val.length)),
    description: 'transform',
  },

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

beforeAll(() => {
  setFaker(faker)
})

const invalidSuits: { schema: z.ZodType; description?: string; only?: boolean; async?: boolean }[] = [
  // array
  { schema: z.array(z.number()).min(6).max(4), description: 'min > max' },
  { schema: z.array(z.number()).min(6).length(5), description: 'min > length' },
  { schema: z.array(z.number()).max(4).length(5), description: 'max < length' },
  { schema: z.array(z.number()).length(1).length(2), description: 'length !== length' },

  // bigint
  { schema: z.bigint().min(6n).max(4n), description: 'min > max' },
  { schema: z.bigint().min(4n).max(6n).multipleOf(7n), description: 'multipleOf is not in range' },

  // date
  {
    schema: z.date().min(new Date('3333-01-01T00:00:00.000Z')).max(new Date('2222-01-01T00:00:00.000Z')),
    description: 'min > max',
  },
  {
    schema: z.date().max(new Date('1111-01-01T00:00:00.000Z')).min(new Date('2222-01-01T00:00:00.000Z')),
    description: 'max < min',
  },
  {
    schema: z
      .date()
      .min(new Date('1111-01-01T00:00:00.000Z'))
      .min(new Date('3333-01-01T00:00:00.000Z'))
      .min(new Date('2222-01-01T00:00:00.000Z'))
      .max(new Date('2222-01-01T00:00:00.000Z')),
    description: 'multiple min',
  },
  {
    schema: z
      .date()
      .max(new Date('2222-01-01T00:00:00.000Z'))
      .max(new Date('1111-01-01T00:00:00.000Z'))
      .max(new Date('3333-01-01T00:00:00.000Z'))
      .min(new Date('2222-01-01T00:00:00.000Z')),
    description: 'multiple max',
  },

  // never
  { schema: z.never() },
]

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
