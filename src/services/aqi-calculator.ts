import { EPA_PM25_BREAKPOINTS } from '../domain/constants';

export type AqiCategory =
  | 'Good'
  | 'Moderate'
  | 'Unhealthy for Sensitive Groups'
  | 'Unhealthy'
  | 'Very Unhealthy'
  | 'Hazardous';

export interface AqiCalculationResult {
  aqi: number;
  category: AqiCategory;
  primaryPollutant: 'PM2.5';
}

/**
 * Calculates US EPA Air Quality Index for PM2.5 using piecewise linear interpolation.
 * EPA Technical Assistance Document EPA-454/B-18-007
 *
 * I = ((I_high - I_low) / (C_high - C_low)) * (C - C_low) + I_low
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
 * Calculates European Common Air Quality Index (CAQI) normalized to 0-100 max.
 */
export function calculateEuropeanCaqi(pm25: number, pm10: number, no2: number): number {
  // CAQI sub-indices normalized to 0-100 scale
  const pm25Sub = Math.min(100, Math.round((pm25 / 110) * 100));
  const pm10Sub = Math.min(100, Math.round((pm10 / 180) * 100));
  const no2Sub = Math.min(100, Math.round((no2 / 400) * 100));

  return Math.max(pm25Sub, pm10Sub, no2Sub);
}
