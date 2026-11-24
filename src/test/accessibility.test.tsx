import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import * as axe from 'axe-core';
import { Header } from '@/components/Header';
import { MetroPresets } from '@/components/MetroPresets';
import { TelemetryCards } from '@/components/TelemetryCards';
import { ChemicalMatrix } from '@/components/ChemicalMatrix';
import { LifestyleSimulator } from '@/components/LifestyleSimulator';
import { Footer } from '@/components/Footer';
import { METRO_PRESETS } from '@/domain/constants';
import { AtmosphericTelemetry, SimulatorInputs, SimulatorOutputs } from '@/domain/types';

const mockTelemetry: AtmosphericTelemetry = {
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

const mockInputs: SimulatorInputs = {
  commuteMode: 'ice_car',
  commuteDistanceKm: 15,
  maskGrade: 'none',
  indoorHepaActive: false,
  outdoorCardioHours: 1,
};

const mockOutputs: SimulatorOutputs = {
  dailyInhaledPm25Dosage: 1258.4,
  baselineDosage: 1258.4,
  dosageReductionPercentage: 0,
  dailyCarbonAbatedKg: 0,
  monthlyHealthSavingsInr: 0,
  personalHealthShieldScore: 10,
};

describe('Accessibility & WCAG 2.2 AA Audit Suite', () => {
  it('Header has 0 axe violations', async () => {
    const { container } = render(
      <Header
        language="en"
        setLanguage={() => {}}
        isDark={false}
        setIsDark={() => {}}
        onRefresh={() => {}}
      />
    );
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('MetroPresets has 0 axe violations', async () => {
    const { container } = render(
      <MetroPresets
        selectedPreset={METRO_PRESETS[0]!}
        onSelectPreset={() => {}}
        language="en"
      />
    );
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('TelemetryCards has 0 axe violations', async () => {
    const { container } = render(
      <TelemetryCards telemetry={mockTelemetry} language="en" />
    );
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('ChemicalMatrix has 0 axe violations', async () => {
    const { container } = render(
      <ChemicalMatrix telemetry={mockTelemetry} language="en" />
    );
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('LifestyleSimulator has 0 axe violations', async () => {
    const { container } = render(
      <LifestyleSimulator
        inputs={mockInputs}
        onInputChange={() => {}}
        outputs={mockOutputs}
        language="en"
      />
    );
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('Footer has 0 axe violations', async () => {
    const { container } = render(<Footer language="en" />);
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
