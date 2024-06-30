import * as z from 'zod'
import { fake, install } from '../src'
import { testMultipleTimes } from './util'

beforeEach(() => {
  install()
})

testMultipleTimes('e2e', async () => {
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

  const data = fake(schema)

  expect(schema.safeParse(data).success).toBe(true)

  await data.promise
})
