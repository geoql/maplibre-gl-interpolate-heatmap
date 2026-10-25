import { describe, expect, it } from 'vite-plus/test';
import {
  PALETTES,
  legendGradient,
  paletteById,
  valueToColorGlsl,
} from '../example/app/utils/palettes';

describe('palettes', () => {
  it('leaves the default ramp to the layer', () => {
    expect(valueToColorGlsl('spectral')).toBeUndefined();
  });

  it('emits a GLSL valueToColor with one branch per segment', () => {
    const glsl = valueToColorGlsl('thermal') ?? '';
    const stops = paletteById('thermal').stops.length;
    expect(glsl).toMatch(/^vec3 valueToColor\(float value\) \{/);
    expect(glsl.match(/if \(v <=/g)).toHaveLength(stops - 1);
    expect(glsl.trim().endsWith('}')).toBe(true);
  });

  it('builds a legend gradient from the same stops', () => {
    for (const palette of PALETTES) {
      const css = legendGradient(palette.id);
      expect(css.startsWith('linear-gradient(to right, ')).toBe(true);
      expect(css.match(/rgb\(/g)).toHaveLength(palette.stops.length);
      expect(css).toContain(' 0%');
      expect(css).toContain(' 100%');
    }
  });
});
