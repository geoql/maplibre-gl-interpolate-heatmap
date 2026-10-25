<script setup lang="ts">
const props = defineProps<{
  label: string;
  hint: string;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
}>();

const model = defineModel<number>({ required: true });
const emit = defineEmits<{ commit: [value: number] }>();
const id = useId();

function onInput(event: Event) {
  if (event.currentTarget instanceof HTMLInputElement) {
    model.value = Number(event.currentTarget.value);
  }
}
</script>

<template>
  <div class="grid gap-1.5">
    <div class="flex items-baseline justify-between gap-3">
      <label :for="id" class="text-sm text-ink">{{ props.label }}</label>
      <output :for="id" class="font-mono text-xs text-accent-ink">
        {{ props.format(model) }}
      </output>
    </div>
    <input
      :id="id"
      type="range"
      class="w-full accent-accent"
      :min="props.min"
      :max="props.max"
      :step="props.step"
      :value="model"
      :aria-describedby="`${id}-hint`"
      @input="onInput"
      @change="emit('commit', model)"
    />
    <p :id="`${id}-hint`" class="text-xs text-ink-3">{{ props.hint }}</p>
  </div>
</template>
