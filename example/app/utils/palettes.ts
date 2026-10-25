/**
 * Colour ramps for the layer's `valueToColor` option. Each ramp is a list of
 * evenly spaced RGB stops (0–1). The same stops build the GLSL function the
 * layer compiles and the CSS gradient of the legend, so the two never drift.
 */
export type PaletteId = 'spectral' | 'thermal' | 'ocean';

type Rgb = readonly [number, number, number];

interface Palette {
  id: PaletteId;
  label: string;
  stops: readonly Rgb[];
}

/** The library default (blue → green → red), written out as stops. */
const SPECTRAL: readonly Rgb[] = [
  [0, 0, 1],
  [0, 1, 0],
  [1, 0, 0],
];

export const PALETTES: readonly Palette[] = [
  { id: 'spectral', label: 'Default', stops: SPECTRAL },
  {
    id: 'thermal',
    label: 'Thermal',
    stops: [
      [0.05, 0.03, 0.2],
      [0.42, 0.06, 0.45],
      [0.83, 0.25, 0.27],
      [0.98, 0.62, 0.1],
      [0.99, 0.95, 0.65],
    ],
  },
  {
    id: 'ocean',
    label: 'Diverging',
    stops: [
      [0.13, 0.32, 0.62],
      [0.55, 0.75, 0.86],
      [0.96, 0.95, 0.9],
      [0.95, 0.65, 0.48],
      [0.7, 0.18, 0.17],
    ],
  },
];

export function paletteById(id: PaletteId): Palette {
  return PALETTES.find((p) => p.id === id) ?? PALETTES[0]!;
}

const glslFloat = (n: number): string => n.toFixed(3);
const glslVec3 = ([r, g, b]: Rgb): string =>
  `vec3(${glslFloat(r)}, ${glslFloat(g)}, ${glslFloat(b)})`;

/**
 * GLSL `vec3 valueToColor(float value)` for a palette. `undefined` for the
 * default ramp, so the demo also exercises the layer's built-in function.
 */
export function valueToColorGlsl(id: PaletteId): string | undefined {
  if (id === 'spectral') return undefined;
  const { stops } = paletteById(id);
  const segments = stops.length - 1;
  const lines = stops.slice(0, -1).map((stop, i) => {
    const next = stops[i + 1]!;
    const lo = glslFloat(i / segments);
    const hi = glslFloat((i + 1) / segments);
    return `  if (v <= ${hi}) return mix(${glslVec3(stop)}, ${glslVec3(next)}, (v - ${lo}) / (${hi} - ${lo}));`;
  });
  return [
    'vec3 valueToColor(float value) {',
    '  float v = clamp(value, 0.0, 1.0);',
    ...lines,
    `  return ${glslVec3(stops[segments]!)};`,
    '}',
  ].join('\n');
}

/** CSS `linear-gradient` for the legend, left (min) to right (max). */
export function legendGradient(id: PaletteId): string {
  const { stops } = paletteById(id);
  const segments = stops.length - 1;
  const parts = stops.map(([r, g, b], i) => {
    const pct = Math.round((i / segments) * 100);
    return `rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)}) ${pct}%`;
  });
  return `linear-gradient(to right, ${parts.join(', ')})`;
}
