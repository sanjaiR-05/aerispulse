import { SimulatorInputs } from '../domain/types';
import { SHIELD_THRESHOLDS, SHIELD_WEIGHTS } from '../domain/constants';

/**
 * Calculates the Personal Health Shield Score (0-100), an individual epidemiological defense index
 * combining respiratory barrier protection, indoor HEPA particulate clearance, transit mode attenuation,
 * and high-ventilation outdoor cardio exposure penalties under elevated AQI conditions.
 *
 * All weights are declared once in {@link SHIELD_WEIGHTS}, so the published methodology and the
 * implementation share a single source of truth.
 *
 * @param inputs - Active lifestyle simulator behavioral inputs
 * @param aqi - Real-time US EPA Air Quality Index of the active region
 * @returns {number} Normalized defense score bounded in [0, 100]
 *
 * @example
 * ```ts
 * const shieldScore = calculatePersonalHealthShieldScore({
 *   commuteMode: 'metro_electric_bus',
 *   commuteDistanceKm: 15,
 *   maskGrade: 'n95_ffp2',
 *   indoorHepaActive: true,
 *   outdoorCardioHours: 1,
 * }, 204);
 * // Returns 98
 * ```
 */
export function calculatePersonalHealthShieldScore(
  inputs: SimulatorInputs,
  aqi: number
): number {
  let score: number = SHIELD_WEIGHTS.baseline;

  if (inputs.maskGrade === 'n95_ffp2') {
    score += SHIELD_WEIGHTS.maskN95;
  } else if (inputs.maskGrade === 'surgical_cloth') {
    score += SHIELD_WEIGHTS.maskSurgical;
  }

  if (inputs.indoorHepaActive) {
    score += SHIELD_WEIGHTS.hepaActive;
  }

  if (inputs.commuteMode === 'metro_electric_bus') {
    score += SHIELD_WEIGHTS.metroTransit;
  }

  // Unprotected high-exertion cardio during severe episodes is penalised per hour.
  if (
    aqi > SHIELD_THRESHOLDS.severeAqi &&
    inputs.outdoorCardioHours > 1 &&
    inputs.maskGrade !== 'n95_ffp2'
  ) {
    const penalty = Math.round(inputs.outdoorCardioHours * SHIELD_WEIGHTS.cardioPenaltyPerHour);
    score = Math.max(SHIELD_WEIGHTS.cardioPenaltyFloor, score - penalty);
  }

  // Clean ambient air raises the natural defense floor regardless of protective equipment.
  if (aqi <= SHIELD_THRESHOLDS.goodAqi) {
    score = Math.max(SHIELD_WEIGHTS.goodAirFloor, score + SHIELD_WEIGHTS.goodAirBonus);
  } else if (aqi <= SHIELD_THRESHOLDS.moderateAqi) {
    score = Math.max(SHIELD_WEIGHTS.moderateAirFloor, score + SHIELD_WEIGHTS.moderateAirBonus);
  }

  return Math.min(SHIELD_WEIGHTS.scoreCeiling, Math.max(SHIELD_WEIGHTS.scoreFloor, score));
}
