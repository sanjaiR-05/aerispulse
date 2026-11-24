'use client';

import { useState, useMemo } from 'react';
import {
  SimulatorInputs,
  SimulatorOutputs,
  AtmosphericTelemetry,
} from '@/domain/types';
import {
  calculateDailyInhaledDosage,
  calculateBaselineDosage,
} from '@/services/dosage-calculator';
import { calculateDailyCarbonAbated } from '@/services/carbon-calculator';
import { calculateMonthlyHealthSavings } from '@/services/economic-calculator';
import { calculatePersonalHealthShieldScore } from '@/services/shield-calculator';

/**
 * Default lifestyle baseline inputs matching typical urban commuter profile.
 */
export const DEFAULT_SIMULATOR_INPUTS: SimulatorInputs = {
  commuteMode: 'ice_car',
  commuteDistanceKm: 15,
  maskGrade: 'none',
  indoorHepaActive: false,
  outdoorCardioHours: 1,
};

/**
 * Return interface for the `useSimulator` custom hook.
 */
export interface UseSimulatorResult {
  /** Active user lifestyle simulator parameter configuration */
  inputs: SimulatorInputs;
  /** Setter for lifestyle inputs */
  setInputs: React.Dispatch<React.SetStateAction<SimulatorInputs>>;
  /** Deterministic mathematical outputs derived synchronously from active telemetry and inputs */
  outputs: SimulatorOutputs;
}

/**
 * Custom hook governing the What-If Lifestyle Simulator.
 * Computes deterministic clinical dosage (µg/day), carbon abatement (kg CO2e),
 * economic healthcare savings (INR/month), and Personal Health Shield score (0-100).
 *
 * @param telemetry - Current atmospheric telemetry used for baseline derivations
 * @param initialInputs - Optional initial simulator inputs
 * @returns {UseSimulatorResult} Simulator state and derived outputs
 *
 * @example
 * ```tsx
 * const { inputs, setInputs, outputs } = useSimulator(telemetry);
 * ```
 */
export function useSimulator(
  telemetry: AtmosphericTelemetry,
  initialInputs: SimulatorInputs = DEFAULT_SIMULATOR_INPUTS
): UseSimulatorResult {
  const [inputs, setInputs] = useState<SimulatorInputs>(initialInputs);

  const outputs: SimulatorOutputs = useMemo(() => {
    const pm25 = telemetry.pollutants.pm25;
    const dosageBreakdown = calculateDailyInhaledDosage(pm25, inputs);
    const baseline = calculateBaselineDosage(pm25);

    const reductionPct =
      baseline > 0
        ? Math.max(0, ((baseline - dosageBreakdown.totalInhaledUg) / baseline) * 100)
        : 0;

    const carbonAbated = calculateDailyCarbonAbated(
      inputs.commuteMode,
      inputs.commuteDistanceKm
    );

    const monthlySavings = calculateMonthlyHealthSavings(
      dosageBreakdown.totalInhaledUg,
      baseline
    );

    const shieldScore = calculatePersonalHealthShieldScore(inputs, telemetry.aqiUs);

    return {
      dailyInhaledPm25Dosage: dosageBreakdown.totalInhaledUg,
      baselineDosage: baseline,
      dosageReductionPercentage: Math.round(reductionPct),
      dailyCarbonAbatedKg: carbonAbated,
      monthlyHealthSavingsInr: monthlySavings,
      personalHealthShieldScore: shieldScore,
    };
  }, [telemetry, inputs]);

  return {
    inputs,
    setInputs,
    outputs,
  };
}
