'use client';

import React from 'react';
import { MapPin } from 'lucide-react';
import { METRO_PRESETS } from '@/domain/constants';
import { MetroPreset, SupportedLanguage } from '@/domain/types';
import { TRANSLATIONS } from '@/domain/translations';

/**
 * Properties for the MetroPresets selector component.
 */
export interface MetroPresetsProps {
  /** Currently active metro preset */
  selectedPreset: MetroPreset;
  /** Selection callback handler */
  onSelectPreset: (preset: MetroPreset) => void;
  /** Active internationalization locale */
  language: SupportedLanguage;
}

/**
 * Geographic corridor selection cards enabling instant 1-click evaluation of major Indian urban air basins:
 * Delhi NCR (Continental Inversion), Mumbai (Maritime Aerosol), Bengaluru (Plateau), Chennai (Thermal Coastal).
 *
 * @param props - MetroPresetsProps configuration
 * @returns {JSX.Element} Rendered metro presets button grid
 */
export const MetroPresets: React.FC<MetroPresetsProps> = ({
  selectedPreset,
  onSelectPreset,
  language,
}): React.JSX.Element => {
  const t = TRANSLATIONS[language];

  return (
    <section aria-labelledby="metro-presets-heading" className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          <h2
            id="metro-presets-heading"
            className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            {t.metroPresetsTitle}
          </h2>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {t.judgePresetsHint}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {METRO_PRESETS.map((preset) => {
          const isSelected = selectedPreset.id === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`p-3.5 rounded-xl text-left border transition-all ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 dark:border-blue-500 shadow-sm ring-1 ring-blue-600 dark:ring-blue-500'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
              }`}
              aria-pressed={isSelected}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm text-slate-900 dark:text-white">
                  {preset.name}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {preset.state}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {preset.typology}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
};
