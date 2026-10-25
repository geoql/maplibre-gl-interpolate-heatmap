<script setup lang="ts">
import * as maplibregl from 'maplibre-gl';
import { MaplibreInterpolateHeatmapLayer } from 'maplibre-gl-interpolate-heatmap';
import type { FeatureCollection, Point } from 'geojson';
import type { Station } from '#shared/types/temperature';
import type { PaletteId } from '~/utils/palettes';

const props = defineProps<{
  stations: readonly Station[];
  opacity: number;
  power: number;
  resolution: number;
  palette: PaletteId;
  showStations: boolean;
  minValue: number;
  maxValue: number;
}>();

const emit = defineEmits<{
  hover: [position: { lon: number; lat: number } | null];
}>();

const STYLES = {
  light: 'https://tiles.openfreemap.org/styles/liberty',
  dark: 'https://tiles.openfreemap.org/styles/dark',
} as const;

const HEAT_ID = 'temperature';
const STATIONS_ID = 'stations';

const container = ref<HTMLDivElement | null>(null);
const colorMode = useColorMode();
const isDark = computed(() => colorMode.value === 'dark');
let map: maplibregl.Map | null = null;

/** First symbol layer of the basemap: heat goes under the labels. */
function firstSymbolLayer(m: maplibregl.Map): string | undefined {
  return m.getStyle().layers.find((layer) => layer.type === 'symbol')?.id;
}

function stationsGeoJson(): FeatureCollection<Point> {
  return {
    type: 'FeatureCollection',
    features: props.stations.map((s) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [s.lon, s.lat] },
      properties: { label: `${Math.round(s.val)}°` },
    })),
  };
}

function applyHeatmap(m: maplibregl.Map) {
  if (m.getLayer(HEAT_ID)) m.removeLayer(HEAT_ID);
  if (props.stations.length === 0) return;
  const valueToColor = valueToColorGlsl(props.palette);
  const layer = new MaplibreInterpolateHeatmapLayer({
    id: HEAT_ID,
    // Copies at ±360° so the world copies left and right of the main one
    // are painted too (a wide screen shows more than 360° at low zoom).
    data: [-360, 0, 360].flatMap((shift) =>
      props.stations.map((s) => ({
        lat: s.lat,
        lon: s.lon + shift,
        val: s.val,
      })),
    ),
    opacity: props.opacity,
    p: props.power,
    framebufferFactor: props.resolution,
    minValue: props.minValue,
    maxValue: props.maxValue,
    ...(valueToColor ? { valueToColor } : {}),
  });
  m.addLayer(layer, firstSymbolLayer(m));
}

function applyStations(m: maplibregl.Map) {
  const source = m.getSource<maplibregl.GeoJSONSource>(STATIONS_ID);
  if (source) source.setData(stationsGeoJson());
  else m.addSource(STATIONS_ID, { type: 'geojson', data: stationsGeoJson() });

  if (!m.getLayer(STATIONS_ID)) {
    m.addLayer({
      id: STATIONS_ID,
      type: 'symbol',
      source: STATIONS_ID,
      layout: {
        'text-field': ['get', 'label'],
        'text-font': ['Noto Sans Regular'],
        'text-size': 11,
        'text-allow-overlap': false,
      },
      paint: {
        'text-color': isDark.value ? '#ece9e2' : '#25272e',
        'text-halo-color': isDark.value ? '#1d1f25' : '#f6f4ee',
        'text-halo-width': 1.25,
      },
    });
  }
  m.setLayoutProperty(
    STATIONS_ID,
    'visibility',
    props.showStations ? 'visible' : 'none',
  );
}

function applyAll(m: maplibregl.Map) {
  applyHeatmap(m);
  applyStations(m);
}

onMounted(async () => {
  // A `.client` component renders its template one tick after mount
  // (https://nuxt.com/docs/guide/directory-structure/app/components#client-components).
  await nextTick();
  if (!container.value) return;
  const m = new maplibregl.Map({
    container: container.value,
    style: isDark.value ? STYLES.dark : STYLES.light,
    center: [10, 22],
    zoom: 1.4,
    minZoom: 0.8,
    maxZoom: 9,
    dragRotate: false,
    pitchWithRotate: false,
    touchPitch: false,
    attributionControl: {
      compact: true,
      customAttribution:
        '<a href="https://open-meteo.com/" target="_blank" rel="noopener">Weather data by Open-Meteo.com</a>',
    },
  });
  m.touchZoomRotate.disableRotation();
  m.addControl(
    new maplibregl.NavigationControl({ showCompass: false }),
    'top-right',
  );
  m.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'top-right');

  m.on('style.load', () => applyAll(m));
  m.on('mousemove', (e) =>
    emit('hover', { lon: e.lngLat.wrap().lng, lat: e.lngLat.lat }),
  );
  m.on('click', (e) =>
    emit('hover', { lon: e.lngLat.wrap().lng, lat: e.lngLat.lat }),
  );
  m.getCanvas().addEventListener('mouseleave', () => emit('hover', null));
  map = m;
});

watch(isDark, (dark) => {
  // A new style drops custom layers; `style.load` adds them back.
  map?.setStyle(dark ? STYLES.dark : STYLES.light, { diff: false });
});

watch(
  () => [
    props.stations,
    props.opacity,
    props.power,
    props.resolution,
    props.palette,
    props.minValue,
    props.maxValue,
  ],
  () => {
    if (map?.isStyleLoaded()) applyHeatmap(map);
  },
);

watch(
  () => [props.stations, props.showStations],
  () => {
    if (map?.isStyleLoaded()) applyStations(map);
  },
);

onBeforeUnmount(() => {
  map?.remove();
  map = null;
});
</script>

<template>
  <!-- Sized, not positioned: maplibre-gl.css sets an unlayered
       `.maplibregl-map { position: relative }` that beats Tailwind's layered
       `absolute`, which left the map 0 px tall. -->
  <div
    ref="container"
    class="size-full"
    role="region"
    aria-label="Interpolated world temperature map"
  />
</template>
