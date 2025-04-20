import { faker } from '@faker-js/faker'
import { z } from '@zod/mini'
import { fake, setFaker } from 'zod-schema-faker'

const main = async () => {
  const schema = z.uuid()
  let data: string

  if (process.env.NODE_ENV === 'development') {
    setFaker(faker)
    data = fake(schema)
  } else {
    data = await fetch('https://httpbin.org/uuid')
      .then(response => response.json())
      .then(json => json.uuid)
  }

  const app = document.querySelector<HTMLDivElement>('#app')!
  app.innerHTML = `<pre>${JSON.stringify(schema.safeParse(data), null, 2)}</pre>`
}

main()
