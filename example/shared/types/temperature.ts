/** One sampled station: a grid point with its current air temperature. */
export interface Station {
  lat: number;
  lon: number;
  /** Air temperature 2 m above ground, °C. */
  val: number;
}

/** Shape returned by `GET /api/temperatures`. */
export interface TemperatureSnapshot {
  /** ISO 8601 time of the Open-Meteo "current" reading (UTC). */
  observedAt: string;
  stations: Station[];
}
