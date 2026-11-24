import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAtmosphericTelemetry } from '@/services/telemetry-service';
import { globalCache } from '@/services/cache-service';

describe('Atmospheric Telemetry Service', () => {
  beforeEach(() => {
    globalCache.clear();
    vi.restoreAllMocks();
  });

  it('fetches calibrated fallback telemetry for Delhi NCR when network is absent', async () => {
    // Standard mock throwing network error
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    const telemetry = await getAtmosphericTelemetry('delhi_ncr');
    expect(telemetry.cityId).toBe('delhi_ncr');
    expect(telemetry.cityName).toBe('Delhi NCR');
    // 96.6 µg/m³ sits in the 55.5-125.4 EPA band, so the derived index is 180.
    expect(telemetry.aqiUs).toBe(180);
    expect(telemetry.aqiCategory).toBe('Unhealthy');
    expect(telemetry.pollutants.pm25).toBe(96.6);
    expect(telemetry.europeanCaqi).toBe(88);
    expect(telemetry.isVerified).toBe(false);
  });

  it('falls back to the default corridor for an unknown city identifier', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    const telemetry = await getAtmosphericTelemetry('atlantis_dome');
    expect(telemetry.cityId).toBe('delhi_ncr');
  });

  it('fetches calibrated fallback telemetry for Mumbai Coastal', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    const telemetry = await getAtmosphericTelemetry('mumbai_coastal');
    expect(telemetry.cityId).toBe('mumbai_coastal');
    expect(telemetry.cityName).toBe('Mumbai Coastal');
    expect(telemetry.pollutants.pm25).toBe(52.4);
  });

  it('fetches calibrated fallback telemetry for Bengaluru Corridor', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    const telemetry = await getAtmosphericTelemetry('bengaluru_corridor');
    expect(telemetry.cityId).toBe('bengaluru_corridor');
    expect(telemetry.cityName).toBe('Bengaluru Corridor');
    expect(telemetry.pollutants.pm25).toBe(24.8);
  });

  it('fetches calibrated fallback telemetry for Chennai Industrial', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    const telemetry = await getAtmosphericTelemetry('chennai_industrial');
    expect(telemetry.cityId).toBe('chennai_industrial');
    expect(telemetry.cityName).toBe('Chennai Industrial');
    expect(telemetry.pollutants.pm25).toBe(39.5);
  });

  it('synthesizes telemetry accurately from real API response', async () => {
    const mockApiResponse = {
      current: {
        pm2_5: 45.2,
        pm10: 80.0,
        nitrogen_dioxide: 25.0,
        sulphur_dioxide: 10.0,
        carbon_monoxide: 500.0,
        ozone: 40.0,
        us_aqi: 125,
      },
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);

    const telemetry = await getAtmosphericTelemetry('delhi_ncr');
    expect(telemetry.pollutants.pm25).toBe(45.2);
    expect(telemetry.pollutants.pm10).toBe(80.0);
    expect(telemetry.aqiUs).toBe(125);
  });

  it('returns cached data on repeated calls', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

    const res1 = await getAtmosphericTelemetry('delhi_ncr');
    const res2 = await getAtmosphericTelemetry('delhi_ncr');

    expect(res1.cityId).toBe(res2.cityId);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('derives the AQI locally when the upstream payload omits us_aqi', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        current: {
          pm2_5: 45.2,
          pm10: 80.0,
          nitrogen_dioxide: 25.0,
          sulphur_dioxide: 10.0,
          carbon_monoxide: 500.0,
          ozone: 40.0,
        },
      }),
    } as Response);

    const telemetry = await getAtmosphericTelemetry('delhi_ncr');
    expect(telemetry.aqiUs).toBe(125);
    expect(telemetry.isVerified).toBe(true);
  });
});
