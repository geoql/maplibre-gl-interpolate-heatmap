import { defineConfig } from 'tsdown';
export default defineConfig({
  entry: ['src/index.ts'],
  target: 'node24',
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  external: ['maplibre-gl'],
  inlineOnly: false,
});
