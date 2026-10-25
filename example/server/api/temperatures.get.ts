import type { Station, TemperatureSnapshot } from '#shared/types/temperature';

/**
 * Current 2 m air temperature on a 15° world grid, from Open-Meteo
 * (https://open-meteo.com, CC BY 4.0, no API key).
 *
 * Open-Meteo refreshes "current" values every 15 minutes, so one upstream
 * request per isolate per 15 minutes is enough. The grid stops at ±75°: the
 * layer only accepts latitudes inside the Web Mercator range (±85°).
 */
const STEP = 15;
const LAT_LIMIT = 75;

interface OpenMeteoPoint {
  latitude: number;
  longitude: number;
  current?: { time?: string; temperature_2m?: number };
}

function grid(): { lat: number; lon: number }[] {
  const points: { lat: number; lon: number }[] = [];
  for (let lat = -LAT_LIMIT; lat <= LAT_LIMIT; lat += STEP) {
    for (let lon = -180; lon < 180; lon += STEP) {
      points.push({ lat, lon });
    }
  }
  return points;
}

export default defineCachedEventHandler(
  async (event): Promise<TemperatureSnapshot> => {
    const points = grid();
    const query = new URLSearchParams({
      latitude: points.map((p) => p.lat).join(','),
      longitude: points.map((p) => p.lon).join(','),
      current: 'temperature_2m',
      timezone: 'GMT',
    });

    const response = await $fetch<OpenMeteoPoint[]>(
      `https://api.open-meteo.com/v1/forecast?${query.toString()}`,
    );

    const stations: Station[] = [];
    let observedAt = '';
    response.forEach((reading, index) => {
      const point = points[index];
      const value = reading.current?.temperature_2m;
      if (!point || typeof value !== 'number') return;
      stations.push({ lat: point.lat, lon: point.lon, val: value });
      observedAt ||= reading.current?.time ?? '';
    });

    if (stations.length === 0) {
      throw createError({
        statusCode: 502,
        statusMessage: 'Open-Meteo returned no temperatures',
      });
    }

    setResponseHeader(
      event,
      'cache-control',
      'public, max-age=300, stale-while-revalidate=600',
    );

    return { observedAt: `${observedAt}Z`, stations };
  },
  { maxAge: 900, swr: true, name: 'temperatures' },
);
