<script setup lang="ts">
const props = defineProps<{
  value: number | null;
  position: { lon: number; lat: number } | null;
  status: 'idle' | 'pending' | 'success' | 'error';
}>();

const coords = computed(() => {
  const p = props.position;
  if (!p) return null;
  const lat = `${Math.abs(p.lat).toFixed(1)}°${p.lat >= 0 ? 'N' : 'S'}`;
  const lon = `${Math.abs(p.lon).toFixed(1)}°${p.lon >= 0 ? 'E' : 'W'}`;
  return `${lat} ${lon}`;
});
</script>

<template>
  <div class="grid gap-1" aria-live="polite">
    <p
      class="font-mono text-readout tracking-tight text-accent-ink tabular-nums"
    >
      <template v-if="props.value !== null">
        {{ props.value.toFixed(1) }}<span class="text-ink-3">°C</span>
      </template>
      <span v-else class="text-ink-3">––.–°</span>
    </p>
    <p class="font-mono text-xs text-ink-2">
      <template v-if="props.status === 'pending' || props.status === 'idle'">
        Loading current temperatures…
      </template>
      <template v-else-if="props.status === 'error'">
        Temperatures did not load.
      </template>
      <template v-else-if="coords">IDW estimate at {{ coords }}</template>
      <template v-else>Point at the map to read a value.</template>
    </p>
  </div>
</template>
