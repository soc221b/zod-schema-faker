import { faker } from '@faker-js/faker'
import * as z from 'zod/v4'
import { fake, setFaker } from './dist/v4/zod-schema-faker.es.js'

setFaker(faker)

console.log('Testing simple string intersection...')

try {
  const stringSchema1 = z.string()
  const stringSchema2 = z.string()
  const intersectionSchema = z.intersection(stringSchema1, stringSchema2)

  console.log('Created intersection schema')

  const result = fake(intersectionSchema)
  console.log('Result:', result)
} catch (error) {
  console.error('Error:', error.message)
  console.error('Stack:', error.stack)
}
