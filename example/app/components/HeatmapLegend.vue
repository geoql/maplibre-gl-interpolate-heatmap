<script setup lang="ts">
import type { PaletteId } from '~/utils/palettes';

const props = defineProps<{
  palette: PaletteId;
  minValue: number;
  maxValue: number;
}>();

const fmt = (n: number) => `${n.toFixed(1)}°`;
</script>

<template>
  <figure class="grid gap-1.5">
    <div
      class="h-3 w-full border border-rule"
      :style="{ background: legendGradient(props.palette) }"
      role="img"
      :aria-label="`Colour scale from ${fmt(props.minValue)} to ${fmt(props.maxValue)} Celsius`"
    />
    <figcaption class="flex justify-between font-mono text-xs text-ink-2">
      <span>{{ fmt(props.minValue) }}</span>
      <span class="text-ink-3">minValue → maxValue</span>
      <span>{{ fmt(props.maxValue) }}</span>
    </figcaption>
  </figure>
</template>
