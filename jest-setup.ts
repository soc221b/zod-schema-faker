import { uninstall } from './src'

afterEach(() => {
  jest.restoreAllMocks()
  uninstall()
})
