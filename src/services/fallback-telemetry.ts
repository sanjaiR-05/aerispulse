import { AtmosphericTelemetry } from '../domain/types';
import { DEFAULT_METRO_PRESET_ID } from '../domain/constants';
import { calculateEuropeanCaqi, calculatePm25Aqi } from './aqi-calculator';

/**
 * Raw calibrated pollutant profile for a metropolitan corridor.
 * Only measured concentrations are stored; every derived index is computed,
 * never hand-authored, so the fallback and live paths can never diverge.
 */
export interface CalibratedPollutantProfile {
  cityId: string;
  cityName: string;
  confidenceScore: number;
  latitude: number;
  longitude: number;
  pollutants: {
    pm25: number;
    pm10: number;
    no2: number;
    so2: number;
    co: number;
    o3: number;
  };
}

/**
 * Source descriptor attached to every offline snapshot.
 */
export const FALLBACK_MODEL_SOURCE = 'Calibrated CAMS Baseline Snapshot (Offline Fallback)';

/**
 * Calibrated reference concentrations across the four monitored metropolitan corridors.
 * Values are drawn from representative CAMS episodes for each air basin.
 */
export const CALIBRATED_POLLUTANT_PROFILES: Record<string, CalibratedPollutantProfile> = {
  delhi_ncr: {
    cityId: 'delhi_ncr',
    cityName: 'Delhi NCR',
    confidenceScore: 90,
    latitude: 28.61,
    longitude: 77.21,
    pollutants: { pm25: 96.6, pm10: 99.0, no2: 27.7, so2: 22.8, o3: 62.0, co: 880.0 },
  },
  mumbai_coastal: {
    cityId: 'mumbai_coastal',
    cityName: 'Mumbai Coastal',
    confidenceScore: 92,
    latitude: 19.07,
    longitude: 72.87,
    pollutants: { pm25: 52.4, pm10: 78.0, no2: 34.2, so2: 14.5, o3: 48.0, co: 610.0 },
  },
  bengaluru_corridor: {
    cityId: 'bengaluru_corridor',
    cityName: 'Bengaluru Corridor',
    confidenceScore: 95,
    latitude: 12.97,
    longitude: 77.59,
    pollutants: { pm25: 24.8, pm10: 42.0, no2: 18.1, so2: 6.2, o3: 38.0, co: 390.0 },
  },
  chennai_industrial: {
    cityId: 'chennai_industrial',
    cityName: 'Chennai Industrial',
    confidenceScore: 91,
    latitude: 13.08,
    longitude: 80.27,
    pollutants: { pm25: 39.5, pm10: 64.0, no2: 22.4, so2: 16.8, o3: 44.0, co: 520.0 },
  },
};

/**
 * Resolves a calibrated pollutant profile, falling back to the default metro corridor.
 *
 * @param cityId - Requested metropolitan identifier
 * @returns {CalibratedPollutantProfile} Matching profile or the default corridor profile
 */
export function resolvePollutantProfile(cityId: string): CalibratedPollutantProfile {
  return (
    CALIBRATED_POLLUTANT_PROFILES[cityId] ??
    CALIBRATED_POLLUTANT_PROFILES[DEFAULT_METRO_PRESET_ID]!
  );
}

/**
 * Builds a complete, internally consistent telemetry snapshot from a calibrated
 * pollutant profile. AQI, category, and European CAQI are always derived through
 * the deterministic calculators so every published figure is reproducible.
 *
 * @param cityId - Requested metropolitan identifier
 * @returns {AtmosphericTelemetry} Derived offline telemetry snapshot
 *
 * @example
 * ```ts
 * const snapshot = buildFallbackTelemetry('delhi_ncr');
 * console.log(snapshot.aqiUs, snapshot.aqiCategory);
 * ```
 */
export function buildFallbackTelemetry(cityId: string): AtmosphericTelemetry {
  const profile = resolvePollutantProfile(cityId);
  const { pollutants } = profile;
  const aqi = calculatePm25Aqi(pollutants.pm25);

  return {
    cityId: profile.cityId,
    cityName: profile.cityName,
    timestamp: new Date().toISOString(),
    aqiUs: aqi.aqi,
    aqiCategory: aqi.category,
    primaryPollutant: aqi.primaryPollutant,
    primaryPollutantConcentration: Math.round(pollutants.pm25 * 10) / 10,
    europeanCaqi: calculateEuropeanCaqi(pollutants.pm25, pollutants.pm10, pollutants.no2),
    confidenceScore: profile.confidenceScore,
    isVerified: false,
    modelSource: FALLBACK_MODEL_SOURCE,
    coordinates: { latitude: profile.latitude, longitude: profile.longitude },
    pollutants,
  };
}
