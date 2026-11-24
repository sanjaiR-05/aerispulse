import { CommuteMode, MetroPreset } from './types';

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
 * Default metro preset used whenever an unknown city identifier is supplied.
 */
export const DEFAULT_METRO_PRESET_ID = 'delhi_ncr';

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
 * Average urban transit speeds (km/h) used to convert commute distance into exposure hours.
 */
export const TRANSIT_SPEED_KMH: Record<CommuteMode, number> = {
  ice_car: 25,
  two_wheeler: 25,
  metro_electric_bus: 30,
  bicycle_walk: 12,
};

/**
 * Microenvironmental cabin attenuation applied to ambient PM2.5 during each transit mode.
 */
export const COMMUTE_CABIN_ATTENUATION: Record<CommuteMode, number> = {
  ice_car: 0.15, // AC cabin provides ~15% particulate attenuation
  two_wheeler: 0.0, // Open-air direct inhalation
  metro_electric_bus: 0.35, // Sealed metro cabin with HVAC filters ~35%
  bicycle_walk: 0.0, // Open-air
};

/**
 * Transport emission factors (kg CO2e / passenger-km) aligned with DEFRA 2023 classes.
 * This table is the single source of truth consumed by `carbon-calculator.ts`.
 */
export const CARBON_EMISSION_FACTORS: Record<CommuteMode, number> = {
  ice_car: 0.17, // Single-occupancy ICE car baseline
  two_wheeler: 0.065, // Petrol scooter / motorcycle
  metro_electric_bus: 0.006, // Electric rapid transit with regenerative braking
  bicycle_walk: 0.0, // Zero tailpipe emissions
};

/**
 * Personal Health Shield Score weighting table (points, additive model).
 */
export const SHIELD_WEIGHTS = {
  baseline: 10,
  maskN95: 45,
  maskSurgical: 20,
  hepaActive: 40,
  metroTransit: 3,
  cardioPenaltyPerHour: 5,
  cardioPenaltyFloor: 5,
  goodAirFloor: 85,
  goodAirBonus: 40,
  moderateAirFloor: 65,
  moderateAirBonus: 20,
  scoreFloor: 0,
  scoreCeiling: 100,
} as const;

/**
 * Ambient AQI thresholds used by the Shield Score and severity classifications.
 */
export const SHIELD_THRESHOLDS = {
  severeAqi: 150,
  goodAqi: 50,
  moderateAqi: 100,
} as const;

/**
 * Sliding-window rate limiting policy shared by every API route handler.
 */
export const RATE_LIMIT = {
  windowMs: 60_000,
  maxRequests: 60,
  maxTrackedIps: 10_000,
} as const;


/**
 * Upstream I/O timeouts and cache lifetimes (milliseconds).
 */
export const TELEMETRY_CACHE_TTL_MS = 120_000;
export const FALLBACK_CACHE_TTL_MS = 60_000;
export const TELEMETRY_FETCH_TIMEOUT_MS = 5_000;
export const GENAI_REQUEST_TIMEOUT_MS = 6_000;
export const CHAT_STREAM_TIMEOUT_MS = 10_000;

/**
 * Stable public labels identifying which engine produced an action plan.
 */
export const ENGINE_SOURCE = {
  gemini: 'Google Gemini (Live Model)',
  deterministicFallback: 'AerisPulse Deterministic Rules Engine (Zero-Downtime Fallback)',
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
