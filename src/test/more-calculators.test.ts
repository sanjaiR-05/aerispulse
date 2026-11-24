import { describe, it, expect } from 'vitest';
import { calculatePm25Aqi, calculateEuropeanCaqi } from '@/services/aqi-calculator';
import { calculateDailyInhaledDosage, calculateBaselineDosage } from '@/services/dosage-calculator';
import { calculateDailyCarbonAbated } from '@/services/carbon-calculator';
import { calculateMonthlyHealthSavings } from '@/services/economic-calculator';
import { calculatePersonalHealthShieldScore } from '@/services/shield-calculator';
import { SimulatorInputs, CommuteMode, MaskGrade } from '@/domain/types';

describe('Exhaustive Mathematical Permutations & Boundary Suites', () => {
  // Test every single integer AQI boundary transition
  const testAqiTransitions = [
    { conc: 0.0, expectedAqi: 0, cat: 'Good' },
    { conc: 5.0, expectedAqi: 28, cat: 'Good' },
    { conc: 9.0, expectedAqi: 50, cat: 'Good' },
    { conc: 9.1, expectedAqi: 51, cat: 'Moderate' },
    { conc: 15.0, expectedAqi: 62, cat: 'Moderate' },
    { conc: 25.0, expectedAqi: 81, cat: 'Moderate' },
    { conc: 35.4, expectedAqi: 100, cat: 'Moderate' },
    { conc: 35.5, expectedAqi: 101, cat: 'Unhealthy for Sensitive Groups' },
    { conc: 45.0, expectedAqi: 124, cat: 'Unhealthy for Sensitive Groups' },
    { conc: 55.4, expectedAqi: 150, cat: 'Unhealthy for Sensitive Groups' },
    { conc: 55.5, expectedAqi: 151, cat: 'Unhealthy' },
    { conc: 80.0, expectedAqi: 168, cat: 'Unhealthy' },
    { conc: 125.4, expectedAqi: 200, cat: 'Unhealthy' },
    { conc: 125.5, expectedAqi: 201, cat: 'Very Unhealthy' },
    { conc: 150.0, expectedAqi: 225, cat: 'Very Unhealthy' },
    { conc: 175.0, expectedAqi: 250, cat: 'Very Unhealthy' },
    { conc: 200.0, expectedAqi: 275, cat: 'Very Unhealthy' },
    { conc: 225.4, expectedAqi: 300, cat: 'Very Unhealthy' },
    { conc: 225.5, expectedAqi: 301, cat: 'Hazardous' },
    { conc: 250.0, expectedAqi: 350, cat: 'Hazardous' },
    { conc: 300.0, expectedAqi: 449, cat: 'Hazardous' },
    { conc: 325.4, expectedAqi: 500, cat: 'Hazardous' },
    { conc: 400.0, expectedAqi: 500, cat: 'Hazardous' },
    { conc: 999.0, expectedAqi: 500, cat: 'Hazardous' },
  ];

  testAqiTransitions.forEach(({ conc, expectedAqi, cat }) => {
    it(`calculates AQI for concentration ${conc} -> ${expectedAqi} (${cat})`, () => {
      const res = calculatePm25Aqi(conc);
      expect(res.category).toBe(cat);
      expect(res.aqi).toBe(expectedAqi);
    });
  });

  // Carbon abatement permutations across distances
  const modes: CommuteMode[] = ['ice_car', 'two_wheeler', 'metro_electric_bus', 'bicycle_walk'];
  const distances = [0, 5, 10, 15, 20, 30, 50];

  modes.forEach((mode) => {
    distances.forEach((dist) => {
      it(`calculates carbon abatement for mode ${mode} at distance ${dist}km`, () => {
        const abated = calculateDailyCarbonAbated(mode, dist);
        expect(abated).toBeGreaterThanOrEqual(0);
        if (mode === 'ice_car') expect(abated).toBe(0);
        if (mode === 'bicycle_walk' && dist > 0) expect(abated).toBeGreaterThan(0);
      });
    });
  });

  // Mask and HEPA permutations on dosage
  const maskGrades: MaskGrade[] = ['none', 'surgical_cloth', 'n95_ffp2'];
  const hepaSettings = [true, false];

  maskGrades.forEach((mask) => {
    hepaSettings.forEach((hepa) => {
      it(`calculates dosage for mask ${mask} and HEPA ${hepa}`, () => {
        const inputs: SimulatorInputs = {
          commuteMode: 'metro_electric_bus',
          commuteDistanceKm: 15,
          maskGrade: mask,
          indoorHepaActive: hepa,
          outdoorCardioHours: 1,
        };
        const dosage = calculateDailyInhaledDosage(96.6, inputs);
        expect(dosage.totalInhaledUg).toBeGreaterThan(0);
        const shield = calculatePersonalHealthShieldScore(inputs, 204);
        expect(shield).toBeGreaterThanOrEqual(10);
        expect(shield).toBeLessThanOrEqual(100);
      });
    });
  });
});
