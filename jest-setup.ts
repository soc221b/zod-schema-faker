import { uninstall } from './src/zod-type-kind-to-zod-type-faker'

afterEach(() => {
  jest.restoreAllMocks()
  uninstall()
})
