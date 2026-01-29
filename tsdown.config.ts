import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node24',
  outDir: 'dist',
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  external: ['maplibre-gl'],
  noExternal: ['earcut'],
});
