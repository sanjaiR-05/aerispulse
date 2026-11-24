import { describe, it, expect } from 'vitest';
import { calculatePersonalHealthShieldScore } from '@/services/shield-calculator';
import { SimulatorInputs } from '@/domain/types';

describe('Personal Health Shield Score Calculator', () => {
  const unprotectedInputs: SimulatorInputs = {
    commuteMode: 'ice_car',
    commuteDistanceKm: 15,
    maskGrade: 'none',
    indoorHepaActive: false,
    outdoorCardioHours: 1,
  };

  it('calculates baseline score of 10/100 under severe AQI matching screenshot 2', () => {
    const score = calculatePersonalHealthShieldScore(unprotectedInputs, 204);
    expect(score).toBe(10);
  });

  it('calculates score of 98/100 under full mitigation matching screenshot 3', () => {
    const mitigatedInputs: SimulatorInputs = {
      commuteMode: 'metro_electric_bus',
      commuteDistanceKm: 15,
      maskGrade: 'n95_ffp2',
      indoorHepaActive: true,
      outdoorCardioHours: 1,
    };
    const score = calculatePersonalHealthShieldScore(mitigatedInputs, 204);
    // Base 10 + N95 (45) + HEPA (40) + Metro (3) = 98
    expect(score).toBe(98);
  });

  it('awards 20 points for surgical cloth mask', () => {
    const score = calculatePersonalHealthShieldScore(
      { ...unprotectedInputs, maskGrade: 'surgical_cloth' },
      204
    );
    expect(score).toBe(30);
  });

  it('awards 40 points for active indoor True HEPA purifier', () => {
    const score = calculatePersonalHealthShieldScore(
      { ...unprotectedInputs, indoorHepaActive: true },
      204
    );
    expect(score).toBe(50);
  });

  it('penalizes unprotected outdoor cardio during high AQI', () => {
    const highCardio = calculatePersonalHealthShieldScore(
      { ...unprotectedInputs, outdoorCardioHours: 3 },
      204
    );
    expect(highCardio).toBeLessThanOrEqual(10);
    expect(highCardio).toBeGreaterThanOrEqual(5);
  });

  it('provides naturally high defense index when ambient air is Good (AQI <= 50)', () => {
    const score = calculatePersonalHealthShieldScore(unprotectedInputs, 35);
    expect(score).toBeGreaterThanOrEqual(85);
  });

  it('provides moderate defense index when ambient air is Moderate (AQI <= 100)', () => {
    const score = calculatePersonalHealthShieldScore(unprotectedInputs, 75);
    expect(score).toBeGreaterThanOrEqual(65);
  });

  it('clamps output strictly within 0 to 100 range', () => {
    const minScore = calculatePersonalHealthShieldScore(
      { ...unprotectedInputs, outdoorCardioHours: 10 },
      500
    );
    expect(minScore).toBeGreaterThanOrEqual(0);
    expect(minScore).toBeLessThanOrEqual(100);

    const maxScore = calculatePersonalHealthShieldScore(
      {
        commuteMode: 'metro_electric_bus',
        commuteDistanceKm: 5,
        maskGrade: 'n95_ffp2',
        indoorHepaActive: true,
        outdoorCardioHours: 0,
      },
      30
    );
    expect(maxScore).toBe(100);
  });
});
