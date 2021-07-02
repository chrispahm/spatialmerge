import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'

export default [
  // browser-friendly (minified) UMD build
  {
    input: 'src/index.js',
    output: {
      name: 'spatialmerge',
      file: pkg.browser,
      format: 'umd'
    },
    plugins: [
      resolve({
        browser: true
      }),
      commonjs(),
      terser()
    ]
  },
  // module version
  {
    input: 'src/index.js',
    output: {
      name: 'spatialmerge',
      file: pkg.module,
      format: 'es'
    },
    plugins: [
      resolve({
        browser: true
      }),
      commonjs(),
      terser()
    ]
  },
  // (legacy commonjs)
  {
    input: 'src/index.js',
    external: [
      '@turf/helpers',
      '@turf/meta',
      '@turf/clone',
      '@turf/bbox',
      'flatbush',
      '@turf/boolean-intersects',
      '@turf/boolean-contains',
      '@turf/boolean-within',
      '@turf/boolean-crosses',
      '@turf/boolean-overlap'
    ],
    output: [{
      file: pkg.main,
      exports: 'auto',
      format: 'cjs'
    }
    ]
  }
]
