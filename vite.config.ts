/// <reference types="vitest/config" />
import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ZodSchemaFaker',
      fileName: 'zod-schema-faker',
    },
    rollupOptions: {
      external: ['zod'],
      output: {
        globals: {
          zod: 'Zod',
        },
      },
    },
  },
  plugins: [
    dts({
      include: ['src'],
      rollupTypes: true,
    }),
  ],
})
