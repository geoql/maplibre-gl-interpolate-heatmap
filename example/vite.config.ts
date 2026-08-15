import { defineConfig } from 'vite-plus';

export default defineConfig({
  base: '/maplibre-gl-interpolate-heatmap/',
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
});
