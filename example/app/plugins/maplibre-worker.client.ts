import { setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

/**
 * MapLibre GL v6 builds its worker URL at runtime, so the bundler never sees
 * it and the browser asks for a `maplibre-gl-worker.mjs` that does not exist.
 * `?worker&url` makes Vite emit the worker (with its shared chunk) as one
 * asset and hands back its URL. Same wiring as the v-maplibre docs.
 */
export default defineNuxtPlugin(() => {
  setWorkerUrl(workerUrl);
});
