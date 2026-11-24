import { describe, it, expect } from 'vitest';
import {
  buildFallbackTelemetry,
  CALIBRATED_POLLUTANT_PROFILES,
  FALLBACK_MODEL_SOURCE,
  resolvePollutantProfile,
} from '@/services/fallback-telemetry';

describe('Derived Fallback Telemetry', () => {
  it('derives AQI, category, and CAQI from concentrations for a known corridor', () => {
    const snapshot = buildFallbackTelemetry('mumbai_coastal');

    expect(snapshot.cityId).toBe('mumbai_coastal');
    // 52.4 µg/m³ -> 143 (EPA 55.5 band lower bound is 151; upper band 150 at 55.4)
    expect(snapshot.aqiUs).toBe(143);
    expect(snapshot.aqiCategory).toBe('Unhealthy for Sensitive Groups');
    expect(snapshot.europeanCaqi).toBe(48);
    expect(snapshot.isVerified).toBe(false);
    expect(snapshot.modelSource).toBe(FALLBACK_MODEL_SOURCE);
    expect(snapshot.primaryPollutantConcentration).toBe(52.4);
  });

  it('resolves the default corridor for an unknown identifier', () => {
    const profile = resolvePollutantProfile('unknown_corridor');
    expect(profile.cityId).toBe('delhi_ncr');

    const snapshot = buildFallbackTelemetry('unknown_corridor');
    expect(snapshot.cityId).toBe('delhi_ncr');
  });

  it('keeps every calibrated profile internally consistent', () => {
    for (const cityId of Object.keys(CALIBRATED_POLLUTANT_PROFILES)) {
      const snapshot = buildFallbackTelemetry(cityId);
      expect(snapshot.aqiUs).toBeGreaterThanOrEqual(0);
      expect(snapshot.aqiUs).toBeLessThanOrEqual(500);
      expect(snapshot.europeanCaqi).toBeGreaterThanOrEqual(0);
      expect(snapshot.europeanCaqi).toBeLessThanOrEqual(100);
      expect(snapshot.cityName.length).toBeGreaterThan(0);
    }
  });
});
