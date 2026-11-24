'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from '@/components/Header';
import { MetroPresets } from '@/components/MetroPresets';
import { TelemetryCards } from '@/components/TelemetryCards';
import { ChemicalMatrix } from '@/components/ChemicalMatrix';
import { LifestyleSimulator } from '@/components/LifestyleSimulator';
import { ActionPlanSection } from '@/components/ActionPlanSection';
import { StreamingChat } from '@/components/StreamingChat';
import { Footer } from '@/components/Footer';
import { A11yLiveAnnouncer } from '@/components/A11yLiveAnnouncer';

import { METRO_PRESETS } from '@/domain/constants';
import {
  AtmosphericTelemetry,
  MetroPreset,
  SimulatorInputs,
  SimulatorOutputs,
  SupportedLanguage,
  ActionPlanResponse,
} from '@/domain/types';

import {
  calculateDailyInhaledDosage,
  calculateBaselineDosage,
} from '@/services/dosage-calculator';
import { calculateDailyCarbonAbated } from '@/services/carbon-calculator';
import { calculateMonthlyHealthSavings } from '@/services/economic-calculator';
import { calculatePersonalHealthShieldScore } from '@/services/shield-calculator';

// Calibrated initial baseline state (Delhi NCR)
const INITIAL_DELHI_TELEMETRY: AtmosphericTelemetry = {
  cityId: 'delhi_ncr',
  cityName: 'Delhi NCR',
  timestamp: new Date().toISOString(),
  aqiUs: 204,
  aqiCategory: 'Very Unhealthy',
  primaryPollutant: 'PM2.5',
  primaryPollutantConcentration: 96.6,
  europeanCaqi: 83,
  confidenceScore: 90,
  isVerified: true,
  modelSource: 'Open-Meteo CAMS Atmospheric Model (Active Multi-Station Synthesis)',
  coordinates: { latitude: 28.61, longitude: 77.21 },
  pollutants: {
    pm25: 96.6,
    pm10: 99.0,
    no2: 27.7,
    so2: 22.8,
    o3: 62.0,
    co: 880.0,
  },
};

export default function Home() {
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [isDark, setIsDark] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<MetroPreset>(METRO_PRESETS[0]!);
  const [telemetry, setTelemetry] = useState<AtmosphericTelemetry>(INITIAL_DELHI_TELEMETRY);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [a11yMessage, setA11yMessage] = useState('AerisPulse intelligence dashboard loaded.');

  // Lifestyle Simulator inputs (default baseline state)
  const [simulatorInputs, setSimulatorInputs] = useState<SimulatorInputs>({
    commuteMode: 'ice_car',
    commuteDistanceKm: 15,
    maskGrade: 'none',
    indoorHepaActive: false,
    outdoorCardioHours: 1,
  });

  // Action plan state
  const [actionPlan, setActionPlan] = useState<ActionPlanResponse | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Sync dark class on root document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Fetch telemetry when preset changes
  const fetchTelemetry = useCallback(async (cityId: string) => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/telemetry?cityId=${cityId}`);
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data);
        setA11yMessage(`Updated atmospheric telemetry for ${data.cityName}. AQI is ${data.aqiUs}.`);
      }
    } catch (_err) {
      // Retain existing telemetry state if network fails
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const handleSelectPreset = (preset: MetroPreset) => {
    setSelectedPreset(preset);
    fetchTelemetry(preset.id);
  };

  const handleRefresh = () => {
    fetchTelemetry(selectedPreset.id);
  };

  // Deterministic mathematical outputs derived synchronously
  const outputs: SimulatorOutputs = useMemo(() => {
    const pm25 = telemetry.pollutants.pm25;
    const dosageBreakdown = calculateDailyInhaledDosage(pm25, simulatorInputs);
    const baseline = calculateBaselineDosage(pm25);

    const reductionPct =
      baseline > 0 ? Math.max(0, ((baseline - dosageBreakdown.totalInhaledUg) / baseline) * 100) : 0;

    const carbonAbated = calculateDailyCarbonAbated(
      simulatorInputs.commuteMode,
      simulatorInputs.commuteDistanceKm
    );

    const monthlySavings = calculateMonthlyHealthSavings(dosageBreakdown.totalInhaledUg, baseline);

    const shieldScore = calculatePersonalHealthShieldScore(simulatorInputs, telemetry.aqiUs);

    return {
      dailyInhaledPm25Dosage: dosageBreakdown.totalInhaledUg,
      baselineDosage: baseline,
      dosageReductionPercentage: Math.round(reductionPct),
      dailyCarbonAbatedKg: carbonAbated,
      monthlyHealthSavingsInr: monthlySavings,
      personalHealthShieldScore: shieldScore,
    };
  }, [telemetry, simulatorInputs]);

  // Action Plan generator handler
  const handleGeneratePlan = async () => {
    setIsGeneratingPlan(true);
    setA11yMessage('Synthesizing personalized clinical and behavioral mitigation action plan.');
    try {
      const res = await fetch('/api/action-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cityId: telemetry.cityId,
          cityName: telemetry.cityName,
          language,
          simulatorInputs,
          telemetry: {
            aqiUs: telemetry.aqiUs,
            primaryPollutant: telemetry.primaryPollutant,
            primaryPollutantConcentration: telemetry.primaryPollutantConcentration,
            pollutants: telemetry.pollutants,
          },
        }),
      });

      if (res.ok) {
        const plan = await res.json();
        setActionPlan(plan);
        setA11yMessage('Action plan generated successfully.');
      }
    } catch (_err) {
      // Fallback state handled gracefully
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors">
      <A11yLiveAnnouncer message={a11yMessage} />

      <Header
        language={language}
        setLanguage={setLanguage}
        isDark={isDark}
        setIsDark={setIsDark}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <main id="main-content" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 w-full">
        {/* Metro Presets */}
        <MetroPresets
          selectedPreset={selectedPreset}
          onSelectPreset={handleSelectPreset}
          language={language}
        />

        {/* Live Atmospheric Telemetry Cards */}
        <TelemetryCards telemetry={telemetry} language={language} />

        {/* Chemical Matrix */}
        <ChemicalMatrix telemetry={telemetry} language={language} />

        {/* Interactive What-If Lifestyle Simulator */}
        <LifestyleSimulator
          inputs={simulatorInputs}
          onInputChange={setSimulatorInputs}
          outputs={outputs}
          language={language}
        />

        {/* GenAI Action Engine & Grounded Streaming Chat Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <ActionPlanSection
              actionPlan={actionPlan}
              isLoading={isGeneratingPlan}
              onGeneratePlan={handleGeneratePlan}
              language={language}
            />
          </div>
          <div className="lg:col-span-5">
            <StreamingChat telemetry={telemetry} language={language} />
          </div>
        </div>
      </main>

      <Footer language={language} />
    </div>
  );
}
