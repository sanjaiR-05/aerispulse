import { SimulatorInputs } from '../domain/types';
import { VENTILATION_RATES, MASK_EFFICIENCY, HEPA_EFFICIENCY } from '../domain/constants';

export interface DosageBreakdown {
  commuteInhaledUg: number;
  indoorInhaledUg: number;
  outdoorCardioInhaledUg: number;
  totalInhaledUg: number;
}

/**
 * Calculates human daily inhaled PM2.5 dosage (ug/day).
 * Formulated per WHO AQG 2021 & PNAS GEMM 2018.
 *
 * D = sum( C_j * V_E,j * t_j * (1 - eta_mask) * (1 - eta_filter) )
 */
export function calculateDailyInhaledDosage(
  pm25Concentration: number,
  inputs: SimulatorInputs
): DosageBreakdown {
  // Speed model: transit average speeds in km/h to derive exposure hours
  const transitSpeedKmH: Record<SimulatorInputs['commuteMode'], number> = {
    ice_car: 25,
    two_wheeler: 25,
    metro_electric_bus: 30,
    bicycle_walk: 12,
  };

  const commuteHours = inputs.commuteDistanceKm > 0
    ? inputs.commuteDistanceKm / transitSpeedKmH[inputs.commuteMode]
    : 0;

  const cardioHours = Math.max(0, Math.min( inputs.outdoorCardioHours, 24 - commuteHours ));
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
    two_wheeler: 0.00, // Open-air direct inhalation
    metro_electric_bus: 0.35, // Sealed metro cabin with HVAC filters ~35%
    bicycle_walk: 0.00, // Open-air
  };

  const commuteConcentration = pm25Concentration * (1 - commuteCabinAttenuation[inputs.commuteMode]);
  const commuteInhaledUg =
    commuteConcentration * commuteVentilation[inputs.commuteMode] * commuteHours * maskPenetration;

  // Outdoor cardio ventilation
  const outdoorCardioInhaledUg =
    pm25Concentration * VENTILATION_RATES.highVentilationCardio * cardioHours * maskPenetration;

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
 * Calculates baseline exposure assuming ICE Car, 15km commute, no mask, no HEPA, 1 hr outdoor cardio.
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
