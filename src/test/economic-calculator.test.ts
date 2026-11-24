import { describe, it, expect } from 'vitest';
import { calculateMonthlyHealthSavings } from '@/services/economic-calculator';

describe('Economic Health Savings Calculator', () => {
  it('returns 0 when current dosage equals or exceeds baseline', () => {
    expect(calculateMonthlyHealthSavings(1258.4, 1258.4)).toBe(0);
    expect(calculateMonthlyHealthSavings(1500, 1258.4)).toBe(0);
  });

  it('returns 0 when baseline dosage is zero or negative', () => {
    expect(calculateMonthlyHealthSavings(0, 0)).toBe(0);
    expect(calculateMonthlyHealthSavings(50, -10)).toBe(0);
  });

  it('calculates approximately ₹1870/mo for ~85% reduction matching screenshot 3', () => {
    const savings = calculateMonthlyHealthSavings(190, 1258.4);
    // (1258.4 - 190)/1258.4 * 2200 = 1867.8 -> rounded to nearest 10 = 1870
    expect(savings).toBe(1870);
  });

  it('calculates full savings of ₹2200 for 100% exposure elimination', () => {
    const savings = calculateMonthlyHealthSavings(0, 1000);
    expect(savings).toBe(2200);
  });

  it('calculates half savings for 50% exposure reduction', () => {
    const savings = calculateMonthlyHealthSavings(500, 1000);
    expect(savings).toBe(1100);
  });

  it('rounds to nearest 10 INR', () => {
    const savings = calculateMonthlyHealthSavings(333, 1000);
    expect(savings % 10).toBe(0);
  });
});
