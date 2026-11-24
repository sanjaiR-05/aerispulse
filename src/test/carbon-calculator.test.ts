import { describe, it, expect } from 'vitest';
import { calculateDailyCarbonAbated } from '@/services/carbon-calculator';

describe('Carbon Abatement Calculator (DEFRA 2023 Factors)', () => {
  it('returns zero carbon abated for baseline ICE car', () => {
    const abated = calculateDailyCarbonAbated('ice_car', 15);
    expect(abated).toBe(0);
  });

  it('returns zero for zero commute distance', () => {
    expect(calculateDailyCarbonAbated('metro_electric_bus', 0)).toBe(0);
    expect(calculateDailyCarbonAbated('two_wheeler', 0)).toBe(0);
    expect(calculateDailyCarbonAbated('bicycle_walk', 0)).toBe(0);
  });

  it('returns zero for negative distance', () => {
    expect(calculateDailyCarbonAbated('metro_electric_bus', -10)).toBe(0);
  });

  it('calculates carbon abated for Metro Rail over 15 km matching screenshot 3', () => {
    // 15 km * (0.170 - 0.006) = 2.46 kg CO2/day
    const abated = calculateDailyCarbonAbated('metro_electric_bus', 15);
    expect(abated).toBe(2.46);
  });

  it('calculates carbon abated for Two-Wheeler', () => {
    // 15 km * (0.170 - 0.065) = 15 * 0.105 = 1.58 kg CO2/day
    const abated = calculateDailyCarbonAbated('two_wheeler', 15);
    expect(abated).toBe(1.58);
  });

  it('calculates maximum carbon abated for bicycle/walk', () => {
    // 15 km * (0.170 - 0.000) = 2.55 kg CO2/day
    const abated = calculateDailyCarbonAbated('bicycle_walk', 15);
    expect(abated).toBe(2.55);
  });

  it('scales linearly with distance', () => {
    const abated10 = calculateDailyCarbonAbated('bicycle_walk', 10);
    const abated20 = calculateDailyCarbonAbated('bicycle_walk', 20);
    expect(abated20).toBeCloseTo(abated10 * 2, 2);
  });
});
