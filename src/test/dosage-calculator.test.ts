import { describe, it, expect } from 'vitest';
import {
  calculateDailyInhaledDosage,
  calculateBaselineDosage,
} from '@/services/dosage-calculator';
import { SimulatorInputs } from '@/domain/types';

describe('Atmospheric Inhaled Particulate Matter Dosage Calculator', () => {
  const defaultInputs: SimulatorInputs = {
    commuteMode: 'ice_car',
    commuteDistanceKm: 15,
    maskGrade: 'none',
    indoorHepaActive: false,
    outdoorCardioHours: 1,
  };

  it('calculates dosage for baseline parameters correctly', () => {
    const res = calculateDailyInhaledDosage(96.6, defaultInputs);
    expect(res.totalInhaledUg).toBeGreaterThan(500);
    expect(res.commuteInhaledUg).toBeGreaterThan(0);
    expect(res.indoorInhaledUg).toBeGreaterThan(0);
    expect(res.outdoorCardioInhaledUg).toBeGreaterThan(0);
  });

  it('calculates baseline dosage matching calculateBaselineDosage helper', () => {
    const baseline = calculateBaselineDosage(96.6);
    const direct = calculateDailyInhaledDosage(96.6, defaultInputs).totalInhaledUg;
    expect(baseline).toBe(direct);
  });

  it('reduces commute dosage significantly with N95 mask', () => {
    const unmasked = calculateDailyInhaledDosage(96.6, {
      ...defaultInputs,
      maskGrade: 'none',
    });
    const n95 = calculateDailyInhaledDosage(96.6, {
      ...defaultInputs,
      maskGrade: 'n95_ffp2',
    });

    expect(n95.commuteInhaledUg).toBeLessThan(unmasked.commuteInhaledUg * 0.1);
    expect(n95.totalInhaledUg).toBeLessThan(unmasked.totalInhaledUg);
  });

  it('surgical mask reduces dosage moderately (40% filtration)', () => {
    const unmasked = calculateDailyInhaledDosage(96.6, {
      ...defaultInputs,
      maskGrade: 'none',
    });
    const surgical = calculateDailyInhaledDosage(96.6, {
      ...defaultInputs,
      maskGrade: 'surgical_cloth',
    });

    expect(surgical.outdoorCardioInhaledUg).toBeLessThan(unmasked.outdoorCardioInhaledUg);
    expect(surgical.outdoorCardioInhaledUg).toBeCloseTo(unmasked.outdoorCardioInhaledUg * 0.6, 0);
  });

  it('active indoor True HEPA filtration drastically reduces indoor dosage', () => {
    const noHepa = calculateDailyInhaledDosage(96.6, {
      ...defaultInputs,
      indoorHepaActive: false,
    });
    const withHepa = calculateDailyInhaledDosage(96.6, {
      ...defaultInputs,
      indoorHepaActive: true,
    });

    // Unfiltered indoor infiltration: 30% reduction (70% ambient)
    // HEPA active: 85% reduction (15% ambient)
    expect(withHepa.indoorInhaledUg).toBeLessThan(noHepa.indoorInhaledUg * 0.3);
  });

  it('calculates dosage for zero commute distance', () => {
    const res = calculateDailyInhaledDosage(96.6, {
      ...defaultInputs,
      commuteDistanceKm: 0,
    });
    expect(res.commuteInhaledUg).toBe(0);
  });

  it('calculates dosage for zero outdoor cardio hours', () => {
    const res = calculateDailyInhaledDosage(96.6, {
      ...defaultInputs,
      outdoorCardioHours: 0,
    });
    expect(res.outdoorCardioInhaledUg).toBe(0);
  });

  it('two-wheeler commute has higher minute ventilation than ICE car', () => {
    const car = calculateDailyInhaledDosage(96.6, {
      ...defaultInputs,
      commuteMode: 'ice_car',
    });
    const twoWheeler = calculateDailyInhaledDosage(96.6, {
      ...defaultInputs,
      commuteMode: 'two_wheeler',
    });

    expect(twoWheeler.commuteInhaledUg).toBeGreaterThan(car.commuteInhaledUg);
  });

  it('metro transit provides sealed cabin particulate attenuation', () => {
    const metro = calculateDailyInhaledDosage(96.6, {
      ...defaultInputs,
      commuteMode: 'metro_electric_bus',
    });
    const twoWheeler = calculateDailyInhaledDosage(96.6, {
      ...defaultInputs,
      commuteMode: 'two_wheeler',
    });

    expect(metro.commuteInhaledUg).toBeLessThan(twoWheeler.commuteInhaledUg);
  });

  it('active commute (bicycle/walking) increases exposure due to high physical minute ventilation', () => {
    const bike = calculateDailyInhaledDosage(96.6, {
      ...defaultInputs,
      commuteMode: 'bicycle_walk',
    });
    const car = calculateDailyInhaledDosage(96.6, {
      ...defaultInputs,
      commuteMode: 'ice_car',
    });

    expect(bike.commuteInhaledUg).toBeGreaterThan(car.commuteInhaledUg);
  });

  it('handles zero pollutant concentration cleanly', () => {
    const res = calculateDailyInhaledDosage(0, defaultInputs);
    expect(res.totalInhaledUg).toBe(0);
    expect(res.commuteInhaledUg).toBe(0);
    expect(res.indoorInhaledUg).toBe(0);
    expect(res.outdoorCardioInhaledUg).toBe(0);
  });

  it('handles maximum combination of mitigation protocols (N95 + HEPA + Metro)', () => {
    const fullMitigation = calculateDailyInhaledDosage(96.6, {
      commuteMode: 'metro_electric_bus',
      commuteDistanceKm: 15,
      maskGrade: 'n95_ffp2',
      indoorHepaActive: true,
      outdoorCardioHours: 0,
    });
    const baseline = calculateBaselineDosage(96.6);

    expect(fullMitigation.totalInhaledUg).toBeLessThan(baseline * 0.25);
  });
});
