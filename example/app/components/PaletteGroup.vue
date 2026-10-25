<script setup lang="ts">
import type { PaletteId } from '~/utils/palettes';

const model = defineModel<PaletteId>({ required: true });
const emit = defineEmits<{ commit: [value: PaletteId] }>();

function pick(id: PaletteId) {
  model.value = id;
  emit('commit', id);
}
</script>

<template>
  <fieldset class="grid gap-2">
    <legend class="mb-2 text-sm text-ink">
      Colour ramp
      <span class="font-mono text-xs text-ink-3">valueToColor</span>
    </legend>
    <div class="grid grid-cols-3 gap-px border border-rule bg-rule">
      <button
        v-for="palette in PALETTES"
        :key="palette.id"
        type="button"
        class="grid gap-1.5 bg-paper p-2 text-left transition-colors hover:bg-paper-2"
        :class="
          model === palette.id
            ? 'outline-2 -outline-offset-2 outline-accent'
            : ''
        "
        :aria-pressed="model === palette.id"
        @click="pick(palette.id)"
      >
        <span
          class="block h-2 w-full"
          :style="{ background: legendGradient(palette.id) }"
          aria-hidden="true"
        />
        <span class="text-xs text-ink-2">{{ palette.label }}</span>
      </button>
    </div>
  </fieldset>
</template>
