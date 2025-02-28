import { z } from 'zod'
import { fake } from './fake'
import { getFaker } from './random'
import { ZodTypeFaker } from './zod-type-faker'

const schemas = (() => {
  const Person = z.object({
    name: z.string(),
  })
  const Employee = z.object({
    role: z.string(),
  })

  const simpleSchemas = [
    z.string(),
    z.number(),
    z.bigint(),
    z.boolean(),
    z.date(),
    z.undefined(),
    z.null(),
    z.void(),
    // z.any(),
    z.unknown(),
    // z.never(),
    // z.nan(), // https://github.com/colinhacks/zod/blob/v3.24.1/src/types.ts#L3405
    z.enum(['Salmon', 'Tuna', 'Trout']),
    z.nativeEnum({
      Apple: 'apple',
      Banana: 'banana',
      Cantaloupe: 3,
    } as const),
    z.optional(z.string()),
    z.nullable(z.string()),
    z.intersection(Person, Employee),
    z.union([Person, Employee]),
    z.tuple([z.string(), z.number()]),
    z.promise(z.string()),
  ]
  const arraySchemas = simpleSchemas.map(schema => z.array(schema))
  const objectSchemas = simpleSchemas.map(schema =>
    z.object({
      foo: schema,
    }),
  )
  const recordSchemas = simpleSchemas.map(schema => z.record(z.string(), schema))
  const mapSchemas = simpleSchemas.map(schema => z.map(z.string(), schema))
  const setSchemas = simpleSchemas.map(schema => z.set(schema))

  return [...simpleSchemas, ...arraySchemas, ...objectSchemas, ...recordSchemas, ...mapSchemas, ...setSchemas]
})()

export class ZodAnyFaker extends ZodTypeFaker<z.ZodAny> {
  fake(): z.infer<z.ZodAny> {
    const randomSchema = getFaker().helpers.arrayElement(schemas)
    return fake(randomSchema)
  }
}
