import { describe, expect, it } from 'vite-plus/test';
import { idwEstimate } from '../example/app/utils/idw';

const stations = [
  { lat: 0, lon: 0, val: 10 },
  { lat: 0, lon: 20, val: 30 },
];

describe('idwEstimate', () => {
  it('returns null without stations', () => {
    expect(idwEstimate([], 0, 0, 3)).toBeNull();
  });

  it('returns the station value on top of a station', () => {
    expect(idwEstimate(stations, 20, 0, 3)).toBe(30);
  });

  it('returns the plain mean half-way between two stations', () => {
    expect(idwEstimate(stations, 10, 0, 3)).toBeCloseTo(20, 6);
  });

  it('leans towards the nearer station, more so at higher p', () => {
    const low = idwEstimate(stations, 5, 0, 1);
    const high = idwEstimate(stations, 5, 0, 6);
    expect(low).toBeGreaterThan(10);
    expect(low).toBeLessThan(20);
    expect(high).toBeLessThan(low ?? Number.NaN);
  });
});
