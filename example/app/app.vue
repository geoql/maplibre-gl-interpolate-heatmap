<script setup lang="ts">
import type { TemperatureSnapshot } from '#shared/types/temperature';
import type { PaletteId } from '~/utils/palettes';

// Fetched in the browser: the page paints at once and the map fills in.
const { data, status, refresh } = useFetch<TemperatureSnapshot>(
  '/api/temperatures',
  { server: false, lazy: true },
);

const opacity = ref(0.55);
const power = ref(3);
const resolution = ref(0.3);
const palette = ref<PaletteId>('spectral');
const showStations = ref(false);
const position = ref<{ lon: number; lat: number } | null>(null);

const stations = computed(() => data.value?.stations ?? []);
const values = computed(() => stations.value.map((s) => s.val));
const minValue = computed(() =>
  values.value.length ? Math.min(...values.value) : 0,
);
const maxValue = computed(() =>
  values.value.length ? Math.max(...values.value) : 0,
);

const readout = computed(() =>
  position.value
    ? idwEstimate(
        stations.value,
        position.value.lon,
        position.value.lat,
        power.value,
      )
    : null,
);
</script>

<template>
  <div class="relative min-h-dvh bg-paper text-ink lg:h-dvh lg:overflow-hidden">
    <main class="relative h-map-phone lg:absolute lg:inset-0 lg:h-auto">
      <HeatmapMap
        :stations="stations"
        :opacity="opacity"
        :power="power"
        :resolution="resolution"
        :palette="palette"
        :show-stations="showStations"
        :min-value="minValue"
        :max-value="maxValue"
        @hover="position = $event"
      />
    </main>
    <div
      class="border-t border-rule lg:absolute lg:top-4 lg:left-4 lg:border-t-0"
    >
      <HeatmapPanel
        v-model:opacity="opacity"
        v-model:power="power"
        v-model:resolution="resolution"
        v-model:palette="palette"
        v-model:show-stations="showStations"
        :readout="readout"
        :position="position"
        :status="status"
        :station-count="stations.length"
        :observed-at="data?.observedAt ?? null"
        :min-value="minValue"
        :max-value="maxValue"
        @retry="refresh()"
      />
    </div>
  </div>
</template>
