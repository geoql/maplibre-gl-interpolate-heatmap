import type { Station } from '#shared/types/temperature';

/** Web Mercator x/y in the 0–1 world square (same space the layer uses). */
function mercator(lon: number, lat: number): [number, number] {
  const x = (lon + 180) / 360;
  const sin = Math.sin((lat * Math.PI) / 180);
  const y = 0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI);
  return [x, y];
}

/**
 * Inverse distance weighting at one point: Σ(wᵢ·uᵢ) / Σwᵢ with
 * wᵢ = 1 / d(x, xᵢ)^p — the value the layer's shader computes per pixel.
 * Distances are measured in Mercator space, so the readout matches the
 * colours on screen.
 */
export function idwEstimate(
  stations: readonly Station[],
  lon: number,
  lat: number,
  p: number,
): number | null {
  if (stations.length === 0) return null;
  const [x, y] = mercator(lon, lat);
  let weighted = 0;
  let weights = 0;
  for (const station of stations) {
    const [sx, sy] = mercator(station.lon, station.lat);
    const d = Math.hypot(sx - x, sy - y);
    if (d < 1e-9) return station.val;
    const w = 1 / d ** p;
    weighted += w * station.val;
    weights += w;
  }
  return weighted / weights;
}
