/**
 * Supported internationalization locale codes.
 */
export type SupportedLanguage = 'en' | 'ta' | 'hi';

/**
 * Supported urban transit modalities.
 */
export type CommuteMode =
  | 'ice_car'
  | 'two_wheeler'
  | 'metro_electric_bus'
  | 'bicycle_walk';

/**
 * Respiratory mask certification grades.
 */
export type MaskGrade = 'none' | 'surgical_cloth' | 'n95_ffp2';

/**
 * Metropolitan geographical monitoring preset configuration.
 */
export interface MetroPreset {
  id: string;
  name: string;
  region: string;
  state: string;
  latitude: number;
  longitude: number;
  typology: string;
}

/**
 * Normalized multi-pollutant atmospheric telemetry schema.
 */
export interface AtmosphericTelemetry {
  cityId: string;
  cityName: string;
  timestamp: string;
  aqiUs: number;
  aqiCategory:
    | 'Good'
    | 'Moderate'
    | 'Unhealthy for Sensitive Groups'
    | 'Unhealthy'
    | 'Very Unhealthy'
    | 'Hazardous';
  primaryPollutant: 'PM2.5' | 'PM10' | 'NO2' | 'SO2' | 'CO' | 'O3';
  primaryPollutantConcentration: number;
  europeanCaqi: number;
  confidenceScore: number;
  isVerified: boolean;
  modelSource: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  pollutants: {
    pm25: number;
    pm10: number;
    no2: number;
    so2: number;
    co: number;
    o3: number;
  };
}

/**
 * User inputs governing the What-If Lifestyle Simulator.
 */
export interface SimulatorInputs {
  /** Mode of commute transit */
  commuteMode: CommuteMode;
  /** Commute transit distance traveled per day in kilometers */
  commuteDistanceKm: number;
  /** Respiratory mask grade worn during commute */
  maskGrade: MaskGrade;
  /** Whether indoor true HEPA air filtration is active */
  indoorHepaActive: boolean;
  /** Hours spent outdoors in high-ventilation cardio / physical exertion */
  outdoorCardioHours: number;
}

/**
 * Deterministic mathematical outputs derived by the lifestyle simulator.
 */
export interface SimulatorOutputs {
  /** Inhaled PM2.5 dosage in µg/day */
  dailyInhaledPm25Dosage: number;
  /** Unmitigated baseline dosage in µg/day */
  baselineDosage: number;
  /** Percentage reduction in particulate inhalation relative to baseline */
  dosageReductionPercentage: number;
  /** Carbon emissions abated per day in kg CO2e */
  dailyCarbonAbatedKg: number;
  /** Estimated monthly health economic expenditure savings in INR ₹ */
  monthlyHealthSavingsInr: number;
  /** Composite individual defense shield index score [0-100] */
  personalHealthShieldScore: number;
}

/**
 * Tactical mitigation action directive produced by GenAI or rules engine.
 */
export interface ActionPlanDirective {
  category: 'indoor' | 'commute' | 'health' | 'community';
  title: string;
  urgency: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  description: string;
  impactMetricLabel: string;
  impactMetricValue: string;
}

/**
 * Standardized response envelope for personalized clinical action plans.
 */
export interface ActionPlanResponse {
  cityId: string;
  cityName: string;
  compositeAqi: number;
  primaryPollutant: string;
  executiveSummary: string;
  engineSource:
    | 'Google Gemini 2.0 / 1.5'
    | 'AerisPulse Deterministic Rules Engine (Zero-Downtime Fallback)';
  generatedAt: string;
  directives: ActionPlanDirective[];
}

/**
 * Chat message model for streaming assistant conversation.
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}
