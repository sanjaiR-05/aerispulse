'use client';

import React from 'react';
import { Sliders, Wind, Shield, DollarSign, Leaf, Heart } from 'lucide-react';
import { CommuteMode, MaskGrade, SimulatorInputs, SimulatorOutputs, SupportedLanguage } from '@/domain/types';
import { TRANSLATIONS } from '@/domain/translations';

interface LifestyleSimulatorProps {
  inputs: SimulatorInputs;
  onInputChange: (newInputs: SimulatorInputs) => void;
  outputs: SimulatorOutputs;
  language: SupportedLanguage;
}

export const LifestyleSimulator: React.FC<LifestyleSimulatorProps> = ({
  inputs,
  onInputChange,
  outputs,
  language,
}) => {
  const t = TRANSLATIONS[language];

  const handleModeChange = (mode: CommuteMode) => {
    onInputChange({ ...inputs, commuteMode: mode });
  };

  const handleMaskChange = (mask: MaskGrade) => {
    onInputChange({ ...inputs, maskGrade: mask });
  };

  const handleHepaToggle = () => {
    onInputChange({ ...inputs, indoorHepaActive: !inputs.indoorHepaActive });
  };

  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onInputChange({ ...inputs, commuteDistanceKm: Number(e.target.value) });
  };

  const handleCardioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onInputChange({ ...inputs, outdoorCardioHours: Number(e.target.value) });
  };

  const commuteModes: { id: CommuteMode; label: string }[] = [
    { id: 'ice_car', label: t.ice_car },
    { id: 'two_wheeler', label: t.two_wheeler },
    { id: 'metro_electric_bus', label: t.metro_electric_bus },
    { id: 'bicycle_walk', label: t.bicycle_walk },
  ];

  const maskGrades: { id: MaskGrade; label: string }[] = [
    { id: 'none', label: t.mask_none },
    { id: 'surgical_cloth', label: t.mask_surgical },
    { id: 'n95_ffp2', label: t.mask_n95 },
  ];

  const reductionPercentage = Math.round(outputs.dosageReductionPercentage);

  return (
    <section
      aria-labelledby="simulator-heading"
      className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-1">
        <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
        <h2
          id="simulator-heading"
          className="text-base sm:text-lg font-bold text-slate-900 dark:text-white"
        >
          {t.simulatorTitle}
        </h2>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
        {t.simulatorSubtitle}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs Column */}
        <div className="lg:col-span-6 space-y-5">
          {/* Daily Commute Transit Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {t.transitMode}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {commuteModes.map((mode) => {
                const isSelected = inputs.commuteMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => handleModeChange(mode.id)}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg border text-center transition ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-500 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                    aria-pressed={isSelected}
                  >
                    {mode.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Commute Distance Slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="commute-distance-slider" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t.commuteDistance}
              </label>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                {inputs.commuteDistanceKm} km
              </span>
            </div>
            <input
              id="commute-distance-slider"
              type="range"
              min="0"
              max="50"
              step="1"
              value={inputs.commuteDistanceKm}
              onChange={handleDistanceChange}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              aria-label="Commute Distance in Kilometers"
            />
          </div>

          {/* Respiratory Mask Grade */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {t.maskGrade}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {maskGrades.map((grade) => {
                const isSelected = inputs.maskGrade === grade.id;
                return (
                  <button
                    key={grade.id}
                    onClick={() => handleMaskChange(grade.id)}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg border text-center transition ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-500 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                    aria-pressed={isSelected}
                  >
                    {grade.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Indoor HEPA Air Purifier Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t.indoorHepa}
            </span>
            <button
              onClick={handleHepaToggle}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                inputs.indoorHepaActive ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
              role="switch"
              aria-checked={inputs.indoorHepaActive}
              aria-label="Toggle Indoor True HEPA Air Purifier"
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  inputs.indoorHepaActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Outdoor High-Ventilation Exercise Slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="cardio-hours-slider" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t.outdoorExercise}
              </label>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                {inputs.outdoorCardioHours} hrs
              </span>
            </div>
            <input
              id="cardio-hours-slider"
              type="range"
              min="0"
              max="4"
              step="0.5"
              value={inputs.outdoorCardioHours}
              onChange={handleCardioChange}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              aria-label="Outdoor high-ventilation exercise hours per day"
            />
          </div>
        </div>

        {/* Right Dynamic Impact Display Column */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          {/* Dosage Card */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Wind className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                <span>{t.inhaledDosageTitle}</span>
              </div>
              <span
                className={`text-xs font-bold ${
                  reductionPercentage > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
                }`}
              >
                -{reductionPercentage}% {t.dosageReduction}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                {outputs.dailyInhaledPm25Dosage}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                µg / day
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">
                {t.baseline}: {outputs.baselineDosage} µg
              </span>
            </div>

            <div className="mt-4 w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  reductionPercentage > 50
                    ? 'bg-emerald-500'
                    : reductionPercentage > 20
                    ? 'bg-amber-500'
                    : 'bg-blue-600'
                }`}
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(10, (outputs.dailyInhaledPm25Dosage / (outputs.baselineDosage || 1)) * 100)
                  )}%`,
                }}
                role="progressbar"
                aria-valuenow={outputs.dailyInhaledPm25Dosage}
                aria-valuemin={0}
                aria-valuemax={outputs.baselineDosage || 2000}
                aria-label="Daily Inhaled PM2.5 Dosage Exposure"
              />
            </div>
          </div>

          {/* Abatement & Economics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Daily Carbon Abated */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <Leaf className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t.carbonAbatedTitle}</span>
              </div>
              <div className="flex items-baseline gap-1 mt-1.5">
                <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {outputs.dailyCarbonAbatedKg}
                </span>
                <span className="text-xs text-slate-500 font-medium">kg CO₂/day</span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                {t.carbonFactorNote}
              </p>
            </div>

            {/* Estimated Monthly Health Savings */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                <DollarSign className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t.monthlySavingsTitle}</span>
              </div>
              <div className="flex items-baseline gap-1 mt-1.5">
                <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                  ₹{outputs.monthlyHealthSavingsInr}
                </span>
                <span className="text-xs text-slate-500 font-medium">/ mo</span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                {t.savingsNote}
              </p>
            </div>
          </div>

          {/* Personal Health Shield Score */}
          <div className="p-4 rounded-xl border border-slate-900 dark:border-slate-700 bg-slate-900 text-white shadow-md flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400">
                <Heart className="w-5 h-5 text-blue-400" aria-hidden="true" />
              </div>
              <div>
                <span className="font-bold text-sm block">
                  {t.shieldScoreTitle}
                </span>
                <span className="text-xs text-slate-400">
                  {t.shieldSubtitle}
                </span>
              </div>
            </div>

            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-extrabold border ${
                outputs.personalHealthShieldScore >= 80
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-600'
                  : outputs.personalHealthShieldScore >= 50
                  ? 'bg-amber-950/80 text-amber-400 border-amber-600'
                  : 'bg-rose-950/80 text-rose-400 border-rose-600'
              }`}
            >
              <Shield className="w-4 h-4" aria-hidden="true" />
              <span>{outputs.personalHealthShieldScore}</span>
              <span className="text-xs opacity-70">/100</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
