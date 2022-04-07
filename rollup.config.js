import path from 'path'
import ts from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'
import nodeResolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import commonjs from '@rollup/plugin-commonjs'
import autoExternal from 'rollup-plugin-auto-external'
import json from '@rollup/plugin-json'

const packageDir = path.resolve(__dirname)
const packageResolve = p => path.resolve(packageDir, p)

const defaultFormats = ['esm-bundler', 'esm-browser', 'cjs']
const inlineFormats = process.env.FORMATS && process.env.FORMATS.split(',')
const finalFormats = inlineFormats || defaultFormats

const defaultModes = ['development', 'production']
const inlineModes = process.env.MODES && process.env.MODES.split(',')
const finalModes = inlineModes || defaultModes

let hasChecked = false

const outputConfigs = {
  'esm-bundler': {
    format: 'es',
    file: packageResolve(`dist/index.esm-bundler.js`),
  },
  'esm-browser': {
    format: 'es',
    file: packageResolve(`dist/index.esm-browser.js`),
  },
  cjs: {
    format: 'cjs',
    file: packageResolve(`dist/index.cjs.js`),
  },
}

function createConfig({ format, mode, outputConfig }) {
  const isBundler = /bundler/.test(format)
  const isDev = mode === 'development' || isBundler

  const finalConfig = {
    input: packageResolve('src/index.ts'),
    output: {
      ...outputConfig,
      file: isDev ? outputConfig.file : outputConfig.file.replace(/\.js$/, '.prod.js'),
    },
    plugins: [
      json(),
      commonjs(),
      autoExternal(),
      ts({
        checked: hasChecked === false,
      }),
      nodeResolve(),
      replace({
        preventAssignment: true,
      }),
      isDev ? undefined : terser(),
    ],
  }

  hasChecked = true

  return finalConfig
}

const configs = finalFormats
  .map(format =>
    finalModes.map(mode =>
      createConfig({
        format,
        mode,
        outputConfig: outputConfigs[format],
      }),
    ),
  )
  .reduce((flattedConfigs, configs) => flattedConfigs.concat(...configs), [])

export default configs
