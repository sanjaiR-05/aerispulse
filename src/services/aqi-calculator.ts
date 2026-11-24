import { EPA_PM25_BREAKPOINTS } from '../domain/constants';

/**
 * Standard EPA AQI risk classifications.
 */
export type AqiCategory =
  | 'Good'
  | 'Moderate'
  | 'Unhealthy for Sensitive Groups'
  | 'Unhealthy'
  | 'Very Unhealthy'
  | 'Hazardous';

/**
 * Result structure returned by PM2.5 AQI calculation.
 */
export interface AqiCalculationResult {
  /** US EPA Air Quality Index value bounded [0, 500] */
  aqi: number;
  /** Categorical epidemiological risk classification */
  category: AqiCategory;
  /** Primary atmospheric pollutant driving the index */
  primaryPollutant: 'PM2.5';
}

/**
 * Calculates the US EPA Air Quality Index (AQI) for fine particulate matter (PM2.5)
 * using piecewise linear interpolation per EPA Technical Assistance Document EPA-454/B-18-007.
 *
 * Mathematical Formula:
 * \( I = \frac{I_{high} - I_{low}}{C_{high} - C_{low}} \times (C - C_{low}) + I_{low} \)
 *
 * @param concentration - PM2.5 atmospheric concentration in µg/m³
 * @returns {AqiCalculationResult} The calculated AQI value, risk category, and pollutant descriptor
 *
 * @example
 * ```ts
 * const result = calculatePm25Aqi(96.6);
 * // Returns { aqi: 204, category: 'Very Unhealthy', primaryPollutant: 'PM2.5' }
 * ```
 */
export function calculatePm25Aqi(concentration: number): AqiCalculationResult {
  const truncated = Math.max(0, Math.floor(concentration * 10) / 10);

  for (const bp of EPA_PM25_BREAKPOINTS) {
    if (truncated >= bp.cLow && truncated <= bp.cHigh) {
      const aqi = Math.round(
        ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (truncated - bp.cLow) + bp.iLow
      );
      return {
        aqi: Math.min(500, Math.max(0, aqi)),
        category: bp.category,
        primaryPollutant: 'PM2.5',
      };
    }
  }

  // Beyond upper breakpoint (> 325.4 ug/m3) -> 500 Hazardous
  return {
    aqi: 500,
    category: 'Hazardous',
    primaryPollutant: 'PM2.5',
  };
}

/**
 * Calculates the European Common Air Quality Index (CAQI) grid sub-index normalized to a 0-100 scale.
 * Evaluates max severity across PM2.5, PM10, and NO2.
 *
 * @param pm25 - PM2.5 particulate mass concentration in µg/m³
 * @param pm10 - PM10 coarse particulate mass concentration in µg/m³
 * @param no2 - Nitrogen dioxide concentration in µg/m³
 * @returns {number} Normalized CAQI index value in the range [0, 100]
 *
 * @example
 * ```ts
 * const caqi = calculateEuropeanCaqi(96.6, 99.0, 27.7);
 * // Returns 88
 * ```
 */
export function calculateEuropeanCaqi(pm25: number, pm10: number, no2: number): number {
  // CAQI sub-indices normalized to 0-100 scale
  const pm25Sub = Math.min(100, Math.round((pm25 / 110) * 100));
  const pm10Sub = Math.min(100, Math.round((pm10 / 180) * 100));
  const no2Sub = Math.min(100, Math.round((no2 / 400) * 100));

  return Math.max(pm25Sub, pm10Sub, no2Sub);
}
