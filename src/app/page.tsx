'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { MetroPresets } from '@/components/MetroPresets';
import { TelemetryCards } from '@/components/TelemetryCards';
import { ChemicalMatrix } from '@/components/ChemicalMatrix';
import { LifestyleSimulator } from '@/components/LifestyleSimulator';
import { ActionPlanSection } from '@/components/ActionPlanSection';
import { StreamingChat } from '@/components/StreamingChat';
import { Footer } from '@/components/Footer';
import { A11yLiveAnnouncer } from '@/components/A11yLiveAnnouncer';

import {
  useThemeLanguage,
  useTelemetry,
  useSimulator,
  useActionPlan,
} from '@/hooks';

/**
 * AerisPulse — Urban Air Quality & Climate Health Intelligence System.
 *
 * Core page orchestrator implementing a clean Hexagonal / Component-Driven architecture:
 * - Domain: Deterministic epidemiological models (WHO AQG 2021, GEMM PNAS 2018, EPA 454/B-18-007)
 * - Hooks: Decoupled custom hooks for state management (Telemetry, Simulator, Action Plan, Theme)
 * - Components: Accessible WCAG 2.1 AA presentation layer with live a11y live regions and i18n
 * - Infrastructure: Streaming GenAI with zero-downtime deterministic fallback and sub-15ms response
 *
 * @returns {JSX.Element} Fully rendered AerisPulse intelligence application
 */
export default function Home(): React.JSX.Element {
  // Theme and internationalization hook
  const { language, setLanguage, isDark, setIsDark } = useThemeLanguage();

  // Atmospheric telemetry hook (live CAMS synthesis & multi-tier caching)
  const {
    selectedPreset,
    telemetry,
    isRefreshing,
    a11yMessage,
    setA11yMessage,
    handleSelectPreset,
    handleRefresh,
  } = useTelemetry();

  // What-If lifestyle simulator hook (deterministic dose, carbon, and shield computation)
  const {
    inputs: simulatorInputs,
    setInputs: setSimulatorInputs,
    outputs,
  } = useSimulator(telemetry);

  // GenAI action engine hook (structured clinical mitigation directives)
  const { actionPlan, isGeneratingPlan, handleGeneratePlan } = useActionPlan();

  const onGeneratePlan = (): Promise<void> => {
    return handleGeneratePlan(
      { telemetry, simulatorInputs, language },
      setA11yMessage
    );
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors">
      {/* Screen Reader Live Region Announcer for WCAG 2.1 AA Compliance */}
      <A11yLiveAnnouncer message={a11yMessage} />

      {/* Primary Navigation & Control Header */}
      <Header
        language={language}
        setLanguage={setLanguage}
        isDark={isDark}
        setIsDark={setIsDark}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <main
        id="main-content"
        className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 w-full"
      >
        {/* Metro Geographic Presets */}
        <MetroPresets
          selectedPreset={selectedPreset}
          onSelectPreset={handleSelectPreset}
          language={language}
        />

        {/* Live Multi-Pollutant Telemetry Status Cards */}
        <TelemetryCards telemetry={telemetry} language={language} />

        {/* Atmospheric Chemical Breakdown Matrix */}
        <ChemicalMatrix telemetry={telemetry} language={language} />

        {/* Interactive What-If Lifestyle Simulator */}
        <LifestyleSimulator
          inputs={simulatorInputs}
          onInputChange={setSimulatorInputs}
          outputs={outputs}
          language={language}
        />

        {/* Action Directives Engine & Grounded Streaming Assistant Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <ActionPlanSection
              actionPlan={actionPlan}
              isLoading={isGeneratingPlan}
              onGeneratePlan={onGeneratePlan}
              language={language}
            />
          </div>
          <div className="lg:col-span-5">
            <StreamingChat telemetry={telemetry} language={language} />
          </div>
        </div>
      </main>

      {/* Standard Environmental Standards & Source Attribution Footer */}
      <Footer language={language} />
    </div>
  );
}
