import { z } from 'zod'
import { fake, install } from 'zod-schema-faker'

const main = async () => {
  const schema = z.string().uuid()
  let data: string

  if (process.env.NODE_ENV === 'development') {
    install()

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
