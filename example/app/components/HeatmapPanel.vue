<script setup lang="ts">
import type { DemoControl } from '~/types/analytics';
import type { PaletteId } from '~/utils/palettes';

const props = defineProps<{
  readout: number | null;
  position: { lon: number; lat: number } | null;
  status: 'idle' | 'pending' | 'success' | 'error';
  stationCount: number;
  observedAt: string | null;
  minValue: number;
  maxValue: number;
}>();

const emit = defineEmits<{ retry: [] }>();

const opacity = defineModel<number>('opacity', { required: true });
const power = defineModel<number>('power', { required: true });
const resolution = defineModel<number>('resolution', { required: true });
const palette = defineModel<PaletteId>('palette', { required: true });
const showStations = defineModel<boolean>('showStations', {
  required: true,
});

const { track } = useAnalytics();
const commit = (control: DemoControl, value: number | string | boolean) =>
  track('demo_interaction', { control, value: String(value) });

const observed = computed(() =>
  props.observedAt
    ? new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'UTC',
      }).format(new Date(props.observedAt))
    : null,
);

function toggleStations() {
  showStations.value = !showStations.value;
  commit('stations', showStations.value);
}
</script>

<template>
  <aside
    class="grid content-start gap-6 border-rule bg-paper p-5 lg:max-h-panel lg:w-panel lg:overflow-y-auto lg:border"
    aria-label="Heatmap controls"
  >
    <header class="flex items-start justify-between gap-4">
      <div class="grid gap-2">
        <p class="font-mono text-label tracking-widest text-ink-3 uppercase">
          MapLibre GL custom layer
        </p>
        <h1 class="font-display text-title text-ink">Interpolate heatmap</h1>
      </div>
      <ThemeToggle />
    </header>

    <p class="text-sm leading-relaxed text-ink-2">
      Colour comes from the weighted average of nearby values, not from point
      density. Below: current air temperature at {{ props.stationCount || '…' }}
      grid points, blended on the GPU with inverse distance weighting.
    </p>

    <TemperatureReadout
      :value="props.readout"
      :position="props.position"
      :status="props.status"
    />

    <div
      v-if="props.status === 'error'"
      class="grid gap-2 border border-rule p-3"
    >
      <p class="text-sm text-ink">Open-Meteo did not answer. Try again.</p>
      <button
        type="button"
        class="justify-self-start border border-ink-3 px-3 py-1.5 font-mono text-xs text-ink hover:border-accent"
        @click="emit('retry')"
      >
        retry
      </button>
    </div>

    <HeatmapLegend
      v-if="props.stationCount > 0"
      :palette="palette"
      :min-value="props.minValue"
      :max-value="props.maxValue"
    />

    <div class="grid gap-5 border-t border-rule pt-5">
      <RangeControl
        v-model="opacity"
        label="Opacity"
        hint="opacity: alpha of the coloured layer."
        :min="0.1"
        :max="1"
        :step="0.05"
        :format="(v) => v.toFixed(2)"
        @commit="commit('opacity', $event)"
      />
      <RangeControl
        v-model="power"
        label="Power (p)"
        hint="p: higher values keep colour flat around each point."
        :min="1"
        :max="8"
        :step="0.5"
        :format="(v) => v.toFixed(1)"
        @commit="commit('power', $event)"
      />
      <RangeControl
        v-model="resolution"
        label="Resolution"
        hint="framebufferFactor: share of screen pixels computed."
        :min="0.1"
        :max="1"
        :step="0.05"
        :format="(v) => v.toFixed(2)"
        @commit="commit('resolution', $event)"
      />
      <PaletteGroup v-model="palette" @commit="commit('palette', $event)" />
      <button
        type="button"
        class="flex items-center justify-between border border-rule px-3 py-2 text-sm text-ink transition-colors hover:border-ink-3"
        :aria-pressed="showStations"
        @click="toggleStations"
      >
        Show sample points
        <span
          class="font-mono text-xs"
          :class="showStations ? 'text-accent-ink' : 'text-ink-3'"
        >
          {{ showStations ? 'on' : 'off' }}
        </span>
      </button>
    </div>

    <div class="grid gap-2 border-t border-rule pt-5">
      <p class="font-mono text-label tracking-widest text-ink-3 uppercase">
        Install
      </p>
      <CopyCommand command="pnpm add maplibre-gl-interpolate-heatmap" />
    </div>

    <footer class="grid gap-3 border-t border-rule pt-5 text-xs text-ink-2">
      <div class="flex flex-wrap gap-x-4 gap-y-2">
        <OutboundLink
          href="https://github.com/geoql/maplibre-gl-interpolate-heatmap"
          section="panel"
          class="inline-flex items-center gap-1.5 text-ink hover:text-accent-ink"
        >
          <GithubIcon /> GitHub
        </OutboundLink>
        <OutboundLink
          href="https://www.npmjs.com/package/maplibre-gl-interpolate-heatmap"
          section="panel"
          class="text-ink hover:text-accent-ink"
        >
          npm
        </OutboundLink>
        <OutboundLink
          href="https://jsr.io/@geoql/maplibre-gl-interpolate-heatmap"
          section="panel"
          class="text-ink hover:text-accent-ink"
        >
          JSR
        </OutboundLink>
      </div>
      <p>
        <template v-if="observed">Observed {{ observed }} UTC. </template>
        Data:
        <OutboundLink
          href="https://open-meteo.com/"
          section="attribution"
          class="underline decoration-rule underline-offset-2 hover:text-ink"
        >
          Open-Meteo</OutboundLink
        >
        (CC BY 4.0). Basemap:
        <OutboundLink
          href="https://openfreemap.org/"
          section="attribution"
          class="underline decoration-rule underline-offset-2 hover:text-ink"
        >
          OpenFreeMap</OutboundLink
        >.
      </p>
    </footer>
  </aside>
</template>
