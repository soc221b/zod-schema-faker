const path = require('path')
const ts = require('rollup-plugin-typescript2')
const terser = require('@rollup/plugin-terser').default
const nodeResolve = require('@rollup/plugin-node-resolve').default
const replace = require('@rollup/plugin-replace')
const commonjs = require('@rollup/plugin-commonjs')
const autoExternal = require('rollup-plugin-auto-external')
const json = require('@rollup/plugin-json')

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

module.exports = configs
