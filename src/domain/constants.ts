import { MetroPreset } from './types';

/**
 * Geographic metropolitan monitoring presets covering key Indian air basins.
 */
export const METRO_PRESETS: MetroPreset[] = [
  {
    id: 'delhi_ncr',
    name: 'Delhi NCR',
    region: 'Continental Inversion Basin',
    state: 'Delhi',
    latitude: 28.61,
    longitude: 77.21,
    typology: 'Continental Inversion Basin',
  },
  {
    id: 'mumbai_coastal',
    name: 'Mumbai Coastal',
    region: 'Maritime Aerosol Zone',
    state: 'Maharashtra',
    latitude: 19.07,
    longitude: 72.87,
    typology: 'Maritime Aerosol Zone',
  },
  {
    id: 'bengaluru_corridor',
    name: 'Bengaluru Corridor',
    region: 'Elevated Plateau Basin',
    state: 'Karnataka',
    latitude: 12.97,
    longitude: 77.59,
    typology: 'Elevated Plateau Basin',
  },
  {
    id: 'chennai_industrial',
    name: 'Chennai Industrial',
    region: 'Thermal Coastal Convergence',
    state: 'Tamil Nadu',
    latitude: 13.08,
    longitude: 80.27,
    typology: 'Thermal Coastal Convergence',
  },
];

/**
 * Human minute ventilation rates (m³/hr) across microenvironments per EPA Exposure Factors Handbook.
 */
export const VENTILATION_RATES = {
  restingIndoor: 0.48, // m3/hr
  carMetroCommute: 0.6, // m3/hr
  twoWheelerCommute: 0.9, // m3/hr
  activeCommute: 1.8, // m3/hr
  highVentilationCardio: 3.0, // m3/hr
} as const;

/**
 * Respiratory mask particulate filtration efficiencies.
 */
export const MASK_EFFICIENCY = {
  none: 0.0,
  surgical_cloth: 0.4,
  n95_ffp2: 0.95,
} as const;

/**
 * Indoor air filtration attenuation factors.
 */
export const HEPA_EFFICIENCY = {
  unfilteredIndoorInfiltration: 0.3, // 30% ambient attenuation
  hepaActive: 0.85, // 85% ambient clearance
} as const;

/**
 * Transport emission factors (kg CO2e / passenger-km) per DEFRA 2023.
 */
export const CARBON_EMISSION_FACTORS = {
  ice_car: 0.17, // kg CO2e / km
  two_wheeler: 0.065, // kg CO2e / km
  metro_electric_bus: 0.028, // kg CO2e / km
  bicycle_walk: 0.0, // kg CO2e / km
} as const;

/**
 * US EPA PM2.5 Breakpoints (EPA-454/B-18-007).
 */
export const EPA_PM25_BREAKPOINTS = [
  { cLow: 0.0, cHigh: 9.0, iLow: 0, iHigh: 50, category: 'Good' as const },
  { cLow: 9.1, cHigh: 35.4, iLow: 51, iHigh: 100, category: 'Moderate' as const },
  {
    cLow: 35.5,
    cHigh: 55.4,
    iLow: 101,
    iHigh: 150,
    category: 'Unhealthy for Sensitive Groups' as const,
  },
  { cLow: 55.5, cHigh: 125.4, iLow: 151, iHigh: 200, category: 'Unhealthy' as const },
  { cLow: 125.5, cHigh: 225.4, iLow: 201, iHigh: 300, category: 'Very Unhealthy' as const },
  { cLow: 225.5, cHigh: 325.4, iLow: 301, iHigh: 500, category: 'Hazardous' as const },
];
