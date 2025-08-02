import { z } from 'zod'
import { fake } from './fake'
import { getFaker } from './random'
import { ZodTypeFaker } from './zod-type-faker'

const schemas = (() => {
  const simpleSchemas = [
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
  ]
  const arraySchemas = simpleSchemas.map(schema => z.array(schema))
  const objectSchemas = simpleSchemas.map(schema =>
    z.object({
      foo: schema,
    }),
  )

  return [...simpleSchemas, ...arraySchemas, ...objectSchemas]
})()

export class ZodAnyFaker extends ZodTypeFaker<z.ZodAny> {
  fake(): z.infer<z.ZodAny> {
    const randomSchema = getFaker().helpers.arrayElement(schemas)
    return fake(randomSchema)
  }
}
