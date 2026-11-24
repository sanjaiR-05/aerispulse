import { CommuteMode } from '../domain/types';

/**
 * Calculates daily carbon emissions abated (kg CO2/day) relative to single-occupancy ICE Car baseline.
 * Emission factors per DEFRA 2023 transport emissions database.
 */
export function calculateDailyCarbonAbated(
  mode: CommuteMode,
  distanceKm: number
): number {
  if (distanceKm <= 0) return 0;

  // Emission factor (kg CO2 per passenger-km)
  const baselineFactor = 0.170; // ICE Car baseline
  const modeFactors: Record<CommuteMode, number> = {
    ice_car: 0.170,
    two_wheeler: 0.065,
    metro_electric_bus: 0.006, // High efficiency electric rapid transit (2.46 kg abated over 15km)
    bicycle_walk: 0.000,
  };

  const abatedPerKm = Math.max(0, baselineFactor - modeFactors[mode]);
  const totalAbatedKg = distanceKm * abatedPerKm;

  return Math.round(totalAbatedKg * 100) / 100;
}
