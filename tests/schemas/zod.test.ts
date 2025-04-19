import { beforeAll, expect, test } from 'vitest'
import * as z from 'zod'
import { faker } from '@faker-js/faker'
import { fake } from '../../src/fake'
import { setFaker } from '../../src/random'

enum Enum {
  Enum1 = 'Enum1',
  Enum2 = 'Enum2',
}

const suits: { schema: z.ZodType; description?: string; only?: boolean }[] = [
  { schema: z.any() },

  { schema: z.array(z.string()) },
  { schema: z.array(z.string()).min(1), description: 'min' },
  { schema: z.array(z.string()).max(10), description: 'max' },
  { schema: z.array(z.string()).length(5), description: 'length' },
  { schema: z.array(z.string()).nonempty(), description: 'nonempty' },

  { schema: z.bigint() },
  { schema: z.int64() },
  { schema: z.uint64() },

  { schema: z.boolean() },

  { schema: z.string().catch('catch') },

  { schema: z.date() },
  { schema: z.date().min(new Date('3000-01-01')), description: 'min' },
  { schema: z.date().max(new Date('1000-01-01')), description: 'max' },

  { schema: z.file() },

  { schema: z.string().default('default') },

  { schema: z.enum(['enum1', 'enum2']) },
  { schema: z.enum(Enum) },

  { schema: z.interface({}) },

  { schema: z.lazy(() => z.literal('lazy')) },

  { schema: z.literal('literal') },

  { schema: z.map(z.string(), z.number()) },

  { schema: z.nan() },

  { schema: z.never() },

  // nonoptional
  { schema: z.null().nonoptional() },

  { schema: z.null() },

  // nullable
  { schema: z.literal('nullable').nullable() },

  { schema: z.number() },
  { schema: z.int() },
  { schema: z.float32() },
  { schema: z.float64() },
  { schema: z.int32() },
  { schema: z.uint32() },

  { schema: z.object() },

  // optional
  { schema: z.literal('optional').optional() },

  // pipe
  { schema: z.literal('pipe').pipe(z.transform(val => val.length)) },

  {
    schema: z.partialRecord(z.literal('partial'), z.literal('value')),
    description: 'partial',
  },
  {
    schema: z.partialRecord(
      z.enum(['partial enum key1', 'partial enum key2', 'partial enum key3']),
      z.literal('value'),
    ),
    description: 'partial enum',
  },
  {
    schema: z.partialRecord(
      z.literal(['partial literal key1', 'partial literal key2', 'partial literal key3']),
      z.literal('value'),
    ),
    description: 'partial literal',
  },

  { schema: z.promise(z.literal('promise')) },

  { schema: z.readonly(z.set(z.literal('readonly'))) },

  { schema: z.record(z.literal('record'), z.literal('value')) },
  {
    schema: z.record(z.enum(['enum key1', 'enum key2', 'enum key3']), z.literal('value')),
    description: 'enum',
  },
  {
    schema: z.record(z.literal(['literal key1', 'literal key2', 'literal key3']), z.literal('value')),
    description: 'literal',
  },

  { schema: z.set(z.string()) },
  { schema: z.set(z.string()).min(1), description: 'min' },
  { schema: z.set(z.string()).max(10), description: 'max' },
  { schema: z.set(z.string()).size(5), description: 'size' },

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

  { schema: z.templateLiteral([z.number().int(), 'px']) as any },

  { schema: z.tuple([]) },
  {
    schema: z.tuple([z.literal('tuple1'), z.literal('tuple2')]).rest(z.literal('rest')),
    description: 'rest',
  },

  { schema: z.symbol() },

  { schema: z.undefined() },

  { schema: z.union([z.literal('union1'), z.literal('union2')]) },
  { schema: z.union([z.literal('union1'), z.never()]), description: 'union other and never' },

  { schema: z.unknown() },

  { schema: z.void() },
]

beforeAll(() => {
  setFaker(faker)
})

suits.forEach(({ schema, description, only }) => {
  let name = schema._zod.def.type
  if (description) {
    name += ` ${description}`
  }

  const t = only ? test.only : test
  t(name, async () => {
    switch (schema._zod.def.type) {
      case 'never': {
        expect(() => fake(schema)).toThrowErrorMatchingInlineSnapshot(`[Error: Never]`)
        break
      }
      case 'promise': {
        const result = fake(schema)
        await schema.parseAsync(result)
        break
      }
      default: {
        const result = fake(schema)
        schema.parse(result)
      }
    }
  })
})
