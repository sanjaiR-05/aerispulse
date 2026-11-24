import { SimulatorInputs } from '../domain/types';
import { VENTILATION_RATES, MASK_EFFICIENCY, HEPA_EFFICIENCY } from '../domain/constants';

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
 * Calculates human daily inhaled particulate dosage (\( \mu\text{g/day} \)) across microenvironments
 * formulated in accordance with WHO Global Air Quality Guidelines (2021) and PNAS Global Exposure Mortality Model (GEMM 2018).
 *
 * Microenvironmental Inhalation Formula:
 * \( D = \sum_{j} \left( C_j \times V_{E,j} \times t_j \times (1 - \eta_{mask}) \times (1 - \eta_{filter}) \right) \)
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
  // Transit average speeds in km/h to derive exposure hours
  const transitSpeedKmH: Record<SimulatorInputs['commuteMode'], number> = {
    ice_car: 25,
    two_wheeler: 25,
    metro_electric_bus: 30,
    bicycle_walk: 12,
  };

  const commuteHours =
    inputs.commuteDistanceKm > 0
      ? inputs.commuteDistanceKm / transitSpeedKmH[inputs.commuteMode]
      : 0;

  const cardioHours = Math.max(0, Math.min(inputs.outdoorCardioHours, 24 - commuteHours));
  const indoorHours = Math.max(0, 24 - commuteHours - cardioHours);

  // Mask filtration factor
  const maskFiltration = MASK_EFFICIENCY[inputs.maskGrade];
  const maskPenetration = 1 - maskFiltration;

  // Commute ventilation rate
  const commuteVentilation: Record<SimulatorInputs['commuteMode'], number> = {
    ice_car: VENTILATION_RATES.carMetroCommute,
    two_wheeler: VENTILATION_RATES.twoWheelerCommute,
    metro_electric_bus: VENTILATION_RATES.carMetroCommute,
    bicycle_walk: VENTILATION_RATES.activeCommute,
  };

  // Commute microenvironment attenuation (cabin / window protection)
  const commuteCabinAttenuation: Record<SimulatorInputs['commuteMode'], number> = {
    ice_car: 0.15, // AC cabin provides ~15% particulate attenuation
    two_wheeler: 0.0, // Open-air direct inhalation
    metro_electric_bus: 0.35, // Sealed metro cabin with HVAC filters ~35%
    bicycle_walk: 0.0, // Open-air
  };

  const commuteConcentration =
    pm25Concentration * (1 - commuteCabinAttenuation[inputs.commuteMode]);
  const commuteInhaledUg =
    commuteConcentration *
    commuteVentilation[inputs.commuteMode] *
    commuteHours *
    maskPenetration;

  // Outdoor cardio ventilation
  const outdoorCardioInhaledUg =
    pm25Concentration *
    VENTILATION_RATES.highVentilationCardio *
    cardioHours *
    maskPenetration;

  // Indoor concentration: Unfiltered infiltration (30% reduction) vs Active HEPA (85% reduction)
  const indoorAttenuation = inputs.indoorHepaActive
    ? HEPA_EFFICIENCY.hepaActive
    : HEPA_EFFICIENCY.unfilteredIndoorInfiltration;

  const indoorConcentration = pm25Concentration * (1 - indoorAttenuation);
  const indoorInhaledUg =
    indoorConcentration * VENTILATION_RATES.restingIndoor * indoorHours;

  const totalInhaledUg = commuteInhaledUg + outdoorCardioInhaledUg + indoorInhaledUg;

  return {
    commuteInhaledUg: Math.round(commuteInhaledUg * 10) / 10,
    indoorInhaledUg: Math.round(indoorInhaledUg * 10) / 10,
    outdoorCardioInhaledUg: Math.round(outdoorCardioInhaledUg * 10) / 10,
    totalInhaledUg: Math.round(totalInhaledUg * 10) / 10,
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
