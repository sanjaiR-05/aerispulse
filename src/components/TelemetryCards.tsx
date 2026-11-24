'use client';

import React from 'react';
import { Activity, CheckCircle, ShieldCheck } from 'lucide-react';
import { AtmosphericTelemetry, SupportedLanguage } from '@/domain/types';
import { TRANSLATIONS } from '@/domain/translations';

/**
 * Properties for the TelemetryCards display component.
 */
export interface TelemetryCardsProps {
  /** Active multi-pollutant telemetry dataset */
  telemetry: AtmosphericTelemetry;
  /** Active internationalization locale */
  language: SupportedLanguage;
}

/**
 * Primary atmospheric telemetry grid displaying 4 key analytical cards:
 * 1. US EPA AQI status gauge and category classification
 * 2. Primary driving pollutant identity and particulate mass concentration
 * 3. European CAQI benchmark (0-100)
 * 4. Ground-truth Copernicus Atmosphere Monitoring Service (CAMS) cross-reference verification
 *
 * @param props - TelemetryCardsProps configuration
 * @returns {JSX.Element} Rendered telemetry cards grid
 */
export const TelemetryCards: React.FC<TelemetryCardsProps> = ({
  telemetry,
  language,
}): React.JSX.Element => {
  const t = TRANSLATIONS[language];

  // EPA category styling
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'Good':
        return 'text-emerald-700 bg-emerald-50 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-700';
      case 'Moderate':
        return 'text-amber-700 bg-amber-50 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-700';
      case 'Unhealthy for Sensitive Groups':
        return 'text-orange-700 bg-orange-50 border-orange-300 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-700';
      case 'Unhealthy':
        return 'text-red-700 bg-red-50 border-red-300 dark:bg-red-950/50 dark:text-red-300 dark:border-red-700';
      case 'Very Unhealthy':
        return 'text-purple-700 bg-purple-50 border-purple-300 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-700';
      default:
        return 'text-rose-900 bg-rose-100 border-rose-400 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-700';
    }
  };

  const aqiPercentage = Math.min(100, (telemetry.aqiUs / 300) * 100);

  return (
    <section aria-labelledby="telemetry-heading" className="w-full">
      {/* Title & Telemetry Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-teal-600 dark:text-teal-400" aria-hidden="true" />
          <h2
            id="telemetry-heading"
            className="text-base sm:text-lg font-bold text-slate-900 dark:text-white"
          >
            {t.liveTelemetryTitle} — {telemetry.cityName}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700">
            {t.telemetryConfidence}: {telemetry.confidenceScore}%
          </span>
          <span
            className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md font-bold border ${
              telemetry.isVerified
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
            {telemetry.isVerified ? t.verified : t.baselineTelemetry}
          </span>
        </div>
      </div>

      {/* 4 Main Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Air Quality Status (US EPA) */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
              {t.airQualityStatus}
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {telemetry.aqiUs}
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded border uppercase ${getCategoryColor(
                  telemetry.aqiCategory
                )}`}
              >
                {telemetry.aqiCategory}
              </span>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${aqiPercentage}%` }}
                role="progressbar"
                aria-valuenow={telemetry.aqiUs}
                aria-valuemin={0}
                aria-valuemax={500}
                aria-label="Air Quality Index Scale"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Primary Pollutant */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
              {t.primaryPollutant}
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {telemetry.primaryPollutant}
              </span>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                {telemetry.primaryPollutantConcentration} µg/m³
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
            {t.primaryDriver}
          </p>
        </div>

        {/* Card 3: European CAQI (CAMS) */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
              {t.europeanCaqi}
            </span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {telemetry.europeanCaqi}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                / 100 max
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
            {t.copernicusBenchmark}
          </p>
        </div>

        {/* Card 4: Ground Truth Cross-Ref */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
              {t.groundTruthCrossref}
            </span>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-2 truncate">
              {telemetry.modelSource.split('(')[0]?.trim()}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Lat: {telemetry.coordinates.latitude} | Lon: {telemetry.coordinates.longitude}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-3">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t.activeMultiStation}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
