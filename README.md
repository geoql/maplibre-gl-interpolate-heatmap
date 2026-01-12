# MapLibre GL Interpolate Heatmap

[![CI](https://img.shields.io/github/actions/workflow/status/geoql/maplibre-gl-interpolate-heatmap/ci.yml?branch=main&logo=github-actions&logoColor=white)](https://github.com/geoql/maplibre-gl-interpolate-heatmap/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/maplibre-gl-interpolate-heatmap?logo=npm)](https://www.npmjs.com/package/maplibre-gl-interpolate-heatmap)
[![JSR](https://jsr.io/badges/@geoql/maplibre-gl-interpolate-heatmap)](https://jsr.io/@geoql/maplibre-gl-interpolate-heatmap)
[![npm](https://img.shields.io/npm/dm/maplibre-gl-interpolate-heatmap?logo=npm)](http://npm-stat.com/charts.html?package=maplibre-gl-interpolate-heatmap)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/maplibre-gl-interpolate-heatmap)](https://bundlephobia.com/package/maplibre-gl-interpolate-heatmap)
[![GitHub contributors](https://img.shields.io/github/contributors/geoql/maplibre-gl-interpolate-heatmap)](https://github.com/geoql/maplibre-gl-interpolate-heatmap/graphs/contributors)

[![oxlint](https://img.shields.io/badge/linter-oxlint-7c5dfa?logo=oxc)](https://oxc.rs)
[![prettier](https://img.shields.io/badge/formatter-prettier-f7b93e?logo=prettier)](https://prettier.io/)
[![tsdown](https://img.shields.io/badge/bundler-tsdown-3178c6)](https://tsdown.dev/)
[![typescript](https://img.shields.io/npm/dependency-version/maplibre-gl-interpolate-heatmap/dev/typescript?logo=TypeScript)](https://www.typescriptlang.org/)

---

A MapLibre GL JS custom layer for rendering interpolated heatmaps (extracting average values) with WebGL shaders. Works with **MapLibre GL JS v5+** (WebGL2).

This library was greatly inspired by [temperature-map-gl](https://github.com/ham-systems/temperature-map-gl) and depends on [Earcut](https://github.com/mapbox/earcut).

## Density vs Interpolated Heatmaps

MapLibre provides a built-in heatmap layer that represents the **density** of points:

![Density heatmap](.github/images/densityHeatmap.png)

This library provides an **interpolated** heatmap that calculates colors based on the **weighted average** of surrounding point values:

![Average heatmap](.github/images/averageHeatmap.png)

## Installation

```bash
# npm
npm install maplibre-gl-interpolate-heatmap maplibre-gl

# bun
bun add maplibre-gl-interpolate-heatmap maplibre-gl

# JSR
bunx jsr add @geoql/maplibre-gl-interpolate-heatmap
```

## Usage

```typescript
import maplibregl from 'maplibre-gl';
import { MaplibreInterpolateHeatmapLayer } from 'maplibre-gl-interpolate-heatmap';
import 'maplibre-gl/dist/maplibre-gl.css';

const map = new maplibregl.Map({
  container: 'map',
  style: 'https://demotiles.maplibre.org/style.json',
  center: [0, 20],
  zoom: 2,
});

map.on('load', () => {
  const layer = new MaplibreInterpolateHeatmapLayer({
    id: 'temperature',
    data: [
      { lat: 62.47, lon: 6.18, val: 16 },
      { lat: 48.09, lon: -1.37, val: 20 },
      { lat: 35.68, lon: 139.69, val: 28 },
    ],
    opacity: 0.5,
    minValue: 10,
    maxValue: 35,
  });

  map.addLayer(layer);
});
```

## Options

| Option              | Type                     | Default     | Description                                                      |
| ------------------- | ------------------------ | ----------- | ---------------------------------------------------------------- |
| `id`                | `string`                 | `''`        | Unique layer ID                                                  |
| `data`              | `Array<{lat, lon, val}>` | `[]`        | Data points (latitude must be within -85° to 85°)                |
| `opacity`           | `number`                 | `0.5`       | Layer opacity (0-1)                                              |
| `minValue`          | `number`                 | `Infinity`  | Value mapped to blue color                                       |
| `maxValue`          | `number`                 | `-Infinity` | Value mapped to red color                                        |
| `p`                 | `number`                 | `3`         | IDW power parameter (higher = more uniform colors around points) |
| `framebufferFactor` | `number`                 | `0.3`       | Computation resolution (0-1, lower = faster but less accurate)   |
| `aoi`               | `Array<{lat, lon}>`      | `[]`        | Area of interest polygon (empty = entire map)                    |
| `valueToColor`      | `string`                 | See below   | GLSL function mapping value (0-1) to `vec3` color                |
| `valueToColor4`     | `string`                 | See below   | GLSL function mapping value to `vec4` with alpha                 |

### Custom Color Functions

Default `valueToColor` (blue → green → red gradient):

```glsl
vec3 valueToColor(float value) {
  return vec3(
    max((value - 0.5) * 2.0, 0.0),
    1.0 - 2.0 * abs(value - 0.5),
    max((0.5 - value) * 2.0, 0.0)
  );
}
```

Default `valueToColor4`:

```glsl
vec4 valueToColor4(float value, float defaultOpacity) {
  return vec4(valueToColor(value), defaultOpacity);
}
```

## How It Works

Colors are computed using [Inverse Distance Weighting (IDW)](https://en.wikipedia.org/wiki/Inverse_distance_weighting):

1. Render N textures, each containing `wi * ui` (red) and `wi` (green) per fragment
2. Blend textures with accumulator to sum all contributions
3. Divide red by green channel to get interpolated value `u(x)`
4. Map value to color using the GLSL color function

Where `wi(x) = 1 / d(x, xi)^p` is the weight based on distance.

## Requirements

- **Node.js** >= 24.0.0
- **MapLibre GL JS** >= 3.0.0 (v5+ recommended for WebGL2)

## Contributing

1. Fork and create a feature branch from `main`
2. Make changes following [conventional commits](https://www.conventionalcommits.org/)
3. Ensure commits are signed ([why?](https://withblue.ink/2020/05/17/how-and-why-to-sign-git-commits.html))
4. Submit a PR

```bash
bun install
bun run build
bun run lint
bun run format
```

## License

MIT © [Vinayak Kulkarni](https://github.com/vinayakkulkarni)
