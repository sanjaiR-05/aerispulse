import { SimulatorInputs } from '../domain/types';
import {
  COMMUTE_CABIN_ATTENUATION,
  HEPA_EFFICIENCY,
  MASK_EFFICIENCY,
  TRANSIT_SPEED_KMH,
  VENTILATION_RATES,
} from '../domain/constants';

/**
 * Breakdown of particulate inhalation across daily microenvironments.
 */
export interface DosageBreakdown {
  /** PM2.5 inhaled during daily transit commute in µg */
  commuteInhaledUg: number;
  /** PM2.5 inhaled while resting or working indoors in µg */
  indoorInhaledUg: number;
  /** PM2.5 inhaled during high-ventilation outdoor cardio workouts in µg */
  outdoorCardioInhaledUg: number;
  /** Total cumulative inhaled PM2.5 particulate mass in µg/day */
  totalInhaledUg: number;
}

/**
 * Minute ventilation rates (m³/hr) applied to each commute modality.
 */
const COMMUTE_VENTILATION: Record<SimulatorInputs['commuteMode'], number> = {
  ice_car: VENTILATION_RATES.carMetroCommute,
  two_wheeler: VENTILATION_RATES.twoWheelerCommute,
  metro_electric_bus: VENTILATION_RATES.carMetroCommute,
  bicycle_walk: VENTILATION_RATES.activeCommute,
};

/**
 * Hours in a day, expressed as a named constant for the exposure-time budget.
 */
const HOURS_PER_DAY = 24;

/**
 * Rounds a dosage value to one decimal place for stable presentation.
 *
 * @param value - Raw µg value
 * @returns {number} Value rounded to 0.1 µg
 */
function roundDosage(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Calculates human daily inhaled particulate dosage (\\( \\mu\\text{g/day} \\)) across microenvironments
 * formulated in accordance with WHO Global Air Quality Guidelines (2021) and PNAS Global Exposure Mortality Model (GEMM 2018).
 *
 * Microenvironmental Inhalation Formula:
 * \\( D = \\sum_{j} \\left( C_j \\times V_{E,j} \\times t_j \\times (1 - \\eta_{mask}) \\times (1 - \\eta_{filter}) \\right) \\)
 *
 * @param pm25Concentration - Ambient PM2.5 mass concentration in µg/m³
 * @param inputs - User-defined lifestyle simulator behavioral parameters
 * @returns {DosageBreakdown} Detailed exposure breakdown across commute, indoor, and cardio segments
 *
 * @example
 * ```ts
 * const dosage = calculateDailyInhaledDosage(96.6, {
 *   commuteMode: 'metro_electric_bus',
 *   commuteDistanceKm: 15,
 *   maskGrade: 'n95_ffp2',
 *   indoorHepaActive: true,
 *   outdoorCardioHours: 0,
 * });
 * ```
 */
export function calculateDailyInhaledDosage(
  pm25Concentration: number,
  inputs: SimulatorInputs
): DosageBreakdown {
  const commuteHours =
    inputs.commuteDistanceKm > 0
      ? inputs.commuteDistanceKm / TRANSIT_SPEED_KMH[inputs.commuteMode]
      : 0;

  const cardioHours = Math.max(0, Math.min(inputs.outdoorCardioHours, HOURS_PER_DAY - commuteHours));
  const indoorHours = Math.max(0, HOURS_PER_DAY - commuteHours - cardioHours);

  // Mask filtration factor shared by outdoor microenvironments
  const maskPenetration = 1 - MASK_EFFICIENCY[inputs.maskGrade];

  const commuteConcentration =
    pm25Concentration * (1 - COMMUTE_CABIN_ATTENUATION[inputs.commuteMode]);
  const commuteInhaledUg =
    commuteConcentration *
    COMMUTE_VENTILATION[inputs.commuteMode] *
    commuteHours *
    maskPenetration;

  const outdoorCardioInhaledUg =
    pm25Concentration *
    VENTILATION_RATES.highVentilationCardio *
    cardioHours *
    maskPenetration;

  // Indoor concentration: unfiltered infiltration (30% reduction) vs active HEPA (85% reduction)
  const indoorAttenuation = inputs.indoorHepaActive
    ? HEPA_EFFICIENCY.hepaActive
    : HEPA_EFFICIENCY.unfilteredIndoorInfiltration;

  const indoorInhaledUg =
    pm25Concentration *
    (1 - indoorAttenuation) *
    VENTILATION_RATES.restingIndoor *
    indoorHours;

  return {
    commuteInhaledUg: roundDosage(commuteInhaledUg),
    indoorInhaledUg: roundDosage(indoorInhaledUg),
    outdoorCardioInhaledUg: roundDosage(outdoorCardioInhaledUg),
    totalInhaledUg: roundDosage(commuteInhaledUg + outdoorCardioInhaledUg + indoorInhaledUg),
  };
}

/**
 * Calculates standardized baseline PM2.5 exposure assuming an unmitigated lifestyle
 * (ICE Petrol/Diesel car, 15km commute, no mask, no HEPA filtration, 1 hour outdoor cardio).
 *
 * @param pm25Concentration - Ambient PM2.5 concentration in µg/m³
 * @returns {number} Unmitigated baseline inhaled dosage in µg/day
 *
 * @example
 * ```ts
 * const baseline = calculateBaselineDosage(96.6);
 * // Returns ~615.1 µg/day
 * ```
 */
export function calculateBaselineDosage(pm25Concentration: number): number {
  const baselineInputs: SimulatorInputs = {
    commuteMode: 'ice_car',
    commuteDistanceKm: 15,
    maskGrade: 'none',
    indoorHepaActive: false,
    outdoorCardioHours: 1,
  };
  return calculateDailyInhaledDosage(pm25Concentration, baselineInputs).totalInhaledUg;
}
