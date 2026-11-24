import { CommuteMode } from '../domain/types';

/**
 * Calculates daily greenhouse gas carbon emissions abated (\( \text{kg CO}_2\text{e/day} \))
 * relative to a single-occupancy Internal Combustion Engine (ICE) passenger car baseline.
 * Uses official emission factors from the UK Department for Environment, Food & Rural Affairs (DEFRA 2023).
 *
 * Mathematical Formula:
 * \( E_{abated} = d \times \max(0, EF_{baseline} - EF_{mode}) \)
 *
 * @param mode - Selected urban transit modality
 * @param distanceKm - Commute distance traveled per day in kilometers
 * @returns {number} Carbon emissions abated in kg CO2e rounded to 2 decimal places
 *
 * @example
 * ```ts
 * const abated = calculateDailyCarbonAbated('metro_electric_bus', 15);
 * // Returns 2.46 kg CO2e
 * ```
 */
export function calculateDailyCarbonAbated(
  mode: CommuteMode,
  distanceKm: number
): number {
  if (distanceKm <= 0) return 0;

  // Emission factor (kg CO2 per passenger-km)
  const baselineFactor = 0.17; // ICE Car baseline
  const modeFactors: Record<CommuteMode, number> = {
    ice_car: 0.17,
    two_wheeler: 0.065,
    metro_electric_bus: 0.006, // High efficiency electric rapid transit (2.46 kg abated over 15km)
    bicycle_walk: 0.0,
  };

  const abatedPerKm = Math.max(0, baselineFactor - modeFactors[mode]);
  const totalAbatedKg = distanceKm * abatedPerKm;

  return Math.round(totalAbatedKg * 100) / 100;
}
