import { SimulatorInputs } from '../domain/types';

/**
 * Calculates Personal Health Shield Score (0-100), an individual defense index
 * combining respiratory protection, indoor filtration, and commute mitigation.
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
