import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  target: 'node16',
  clean: true,
  splitting: true,
  cjsInterop: true,
  dts: true,
})
