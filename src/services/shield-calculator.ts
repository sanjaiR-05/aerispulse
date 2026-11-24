import { SimulatorInputs } from '../domain/types';

/**
 * Calculates the Personal Health Shield Score (0-100), an individual epidemiological defense index
 * combining respiratory barrier protection, indoor HEPA particulate clearance, transit mode attenuation,
 * and high-ventilation outdoor cardio exposure penalties under elevated AQI conditions.
 *
 * Scoring Weights:
 * - Baseline Defense: 10 pts
 * - Mask Grade: N95/FFP2 (+45 pts) | Surgical/Cloth (+20 pts) | None (+0 pts)
 * - Indoor True HEPA Recirculation: (+40 pts)
 * - Metro / Electric Bus Cabin: (+3 pts)
 * - Unprotected High-Exertion Cardio Penalty: Up to -5 pts/hour when AQI > 150
 * - Clean Ambient Air Bonus: AQI <= 50 (floor 85 pts) | AQI <= 100 (floor 65 pts)
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
  // Baseline score under severe ambient conditions
  let score = 10;

  // Mask protection contribution (up to 45 pts)
  if (inputs.maskGrade === 'n95_ffp2') {
    score += 45;
  } else if (inputs.maskGrade === 'surgical_cloth') {
    score += 20;
  }

  // Indoor HEPA purifier contribution (up to 40 pts)
  if (inputs.indoorHepaActive) {
    score += 40;
  }

  // Transit mode mitigation factor
  if (inputs.commuteMode === 'metro_electric_bus') {
    score += 3;
  }

  // Penalty for outdoor cardio in high AQI without adequate protection
  if (aqi > 150 && inputs.outdoorCardioHours > 1 && inputs.maskGrade !== 'n95_ffp2') {
    score = Math.max(5, score - Math.round(inputs.outdoorCardioHours * 5));
  }

  // If ambient air is Good (AQI <= 50), baseline defense is naturally high
  if (aqi <= 50) {
    score = Math.max(85, score + 40);
  } else if (aqi <= 100) {
    score = Math.max(65, score + 20);
  }

  return Math.min(100, Math.max(0, score));
}
