/// <reference types="vitest/config" />
import { renameSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry: {
        '.': resolve(__dirname, 'src/v3/index.ts'),
        v3: resolve(__dirname, 'src/v3/index.ts'),
        v4: resolve(__dirname, 'src/v4/index.ts'),
      },
      name: 'ZodSchemaFaker',
      fileName: 'zod-schema-faker',
      formats: [
        'es',
        'cjs',
      ],
    },
    rollupOptions: {
      external: [
        'zod/v3',
        'zod/v4/core',
      ],
      output: [
        {
          format: 'es',
          entryFileNames: '[name]/zod-schema-faker.es.js',
        },
        {
          format: 'cjs',
          entryFileNames: '[name]/zod-schema-faker.cjs',
        },
      ],
    },
  },
  plugins: [
    dts({
      rollupTypes: true,
      afterBuild() {
        const map = {
          'dist/..d.ts': 'dist/zod-schema-faker.d.ts',
          'dist/v3.d.ts': 'dist/v3/zod-schema-faker.d.ts',
          'dist/v4.d.ts': 'dist/v4/zod-schema-faker.d.ts',
        }
        for (const [
          key,
          value,
        ] of Object.entries(map)) {
          renameSync(resolve(__dirname, key), resolve(__dirname, value))
        }
      },
    }),
  ],
  test: {
    coverage: {
      include: [
        'src/**/*',
      ],
      thresholds: {
        '100': true,
      },
    },
  },
})
