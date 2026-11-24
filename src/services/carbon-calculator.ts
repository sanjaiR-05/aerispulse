import { CommuteMode } from '../domain/types';
import { CARBON_EMISSION_FACTORS } from '../domain/constants';

/**
 * Baseline mobile source assumed by every abatement comparison.
 */
const BASELINE_COMMUTE_MODE: CommuteMode = 'ice_car';

/**
 * Calculates daily greenhouse gas carbon emissions abated (\\( \\text{kg CO}_2\\text{e/day} \\))
 * relative to a single-occupancy Internal Combustion Engine (ICE) passenger car baseline.
 * Emission intensities live exclusively in {@link CARBON_EMISSION_FACTORS} so the model,
 * the documented methodology, and the UI can never drift apart.
 *
 * Mathematical Formula:
 * \\( E_{abated} = d \\times \\max(0, EF_{baseline} - EF_{mode}) \\)
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

  const baselineFactor = CARBON_EMISSION_FACTORS[BASELINE_COMMUTE_MODE];
  const abatedPerKm = Math.max(0, baselineFactor - CARBON_EMISSION_FACTORS[mode]);
  const totalAbatedKg = distanceKm * abatedPerKm;

  return Math.round(totalAbatedKg * 100) / 100;
}
