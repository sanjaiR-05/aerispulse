export type SupportedLanguage = 'en' | 'ta' | 'hi';

export type CommuteMode = 'ice_car' | 'two_wheeler' | 'metro_electric_bus' | 'bicycle_walk';

export type MaskGrade = 'none' | 'surgical_cloth' | 'n95_ffp2';

export interface MetroPreset {
  id: string;
  name: string;
  region: string;
  state: string;
  latitude: number;
  longitude: number;
  typology: string;
}

export interface AtmosphericTelemetry {
  cityId: string;
  cityName: string;
  timestamp: string;
  aqiUs: number;
  aqiCategory: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
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

export interface SimulatorInputs {
  commuteMode: CommuteMode;
  commuteDistanceKm: number;
  maskGrade: MaskGrade;
  indoorHepaActive: boolean;
  outdoorCardioHours: number;
}

export interface SimulatorOutputs {
  dailyInhaledPm25Dosage: number; // ug/day
  baselineDosage: number; // ug/day
  dosageReductionPercentage: number; // %
  dailyCarbonAbatedKg: number; // kg CO2/day
  monthlyHealthSavingsInr: number; // INR/month
  personalHealthShieldScore: number; // 0-100
}

export interface ActionPlanDirective {
  category: 'indoor' | 'commute' | 'health' | 'community';
  title: string;
  urgency: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  description: string;
  impactMetricLabel: string;
  impactMetricValue: string;
}

export interface ActionPlanResponse {
  cityId: string;
  cityName: string;
  compositeAqi: number;
  primaryPollutant: string;
  executiveSummary: string;
  engineSource: 'Google Gemini 2.0 / 1.5' | 'AerisPulse Deterministic Rules Engine (Zero-Downtime Fallback)';
  generatedAt: string;
  directives: ActionPlanDirective[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}
