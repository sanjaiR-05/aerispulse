'use client';

import React from 'react';
import { AtmosphericTelemetry, SupportedLanguage } from '@/domain/types';
import { TRANSLATIONS } from '@/domain/translations';

interface ChemicalMatrixProps {
  telemetry: AtmosphericTelemetry;
  language: SupportedLanguage;
}

export const ChemicalMatrix: React.FC<ChemicalMatrixProps> = ({ telemetry, language }) => {
  const t = TRANSLATIONS[language];

  const chemicals = [
    {
      code: 'PM2.5',
      value: telemetry.pollutants.pm25,
      label: 'Fine Aerosol',
    },
    {
      code: 'PM10',
      value: telemetry.pollutants.pm10,
      label: 'Coarse Dust',
    },
    {
      code: 'NO₂',
      value: telemetry.pollutants.no2,
      label: 'Combustion Gas',
    },
    {
      code: 'SO₂',
      value: telemetry.pollutants.so2,
      label: 'Industrial SOx',
    },
    {
      code: 'O₃',
      value: telemetry.pollutants.o3,
      label: 'Surface Ozone',
    },
    {
      code: 'CO',
      value: telemetry.pollutants.co,
      label: 'Carbon Monoxide',
    },
  ];

  return (
    <section aria-labelledby="chemical-matrix-heading" className="w-full">
      <h2
        id="chemical-matrix-heading"
        className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-3"
      >
        {t.chemicalMatrixTitle}
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {chemicals.map((chem) => (
          <div
            key={chem.code}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
          >
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {chem.code}
            </span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              {chem.value}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
              {chem.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
