import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '@/components/Header';
import { MetroPresets } from '@/components/MetroPresets';
import { TelemetryCards } from '@/components/TelemetryCards';
import { ChemicalMatrix } from '@/components/ChemicalMatrix';
import { LifestyleSimulator } from '@/components/LifestyleSimulator';
import { ActionPlanSection } from '@/components/ActionPlanSection';
import { Footer } from '@/components/Footer';
import { METRO_PRESETS } from '@/domain/constants';
import { AtmosphericTelemetry, SimulatorInputs, SimulatorOutputs, ActionPlanResponse } from '@/domain/types';

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

describe('React Component Unit Suite', () => {
  it('renders Header with app title, language switcher, and mode toggle', () => {
    const setLanguage = vi.fn();
    const setIsDark = vi.fn();
    const onRefresh = vi.fn();

    render(
      <Header
        language="en"
        setLanguage={setLanguage}
        isDark={false}
        setIsDark={setIsDark}
        onRefresh={onRefresh}
      />
    );

    expect(screen.getByText('AerisPulse')).toBeInTheDocument();
    expect(screen.getByText('Live v1.0')).toBeInTheDocument();

    const tamilBtn = screen.getByText('தமிழ்');
    fireEvent.click(tamilBtn);
    expect(setLanguage).toHaveBeenCalledWith('ta');

    const refreshBtn = screen.getByLabelText('Refresh live atmospheric telemetry');
    fireEvent.click(refreshBtn);
    expect(onRefresh).toHaveBeenCalled();
  });

  it('renders MetroPresets and allows selecting presets', () => {
    const onSelect = vi.fn();

    render(
      <MetroPresets
        selectedPreset={METRO_PRESETS[0]!}
        onSelectPreset={onSelect}
        language="en"
      />
    );

    expect(screen.getByText('Delhi NCR')).toBeInTheDocument();
    expect(screen.getByText('Mumbai Coastal')).toBeInTheDocument();
    expect(screen.getByText('Bengaluru Corridor')).toBeInTheDocument();
    expect(screen.getByText('Chennai Industrial')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Mumbai Coastal'));
    expect(onSelect).toHaveBeenCalledWith(METRO_PRESETS[1]);
  });

  it('renders TelemetryCards with AQI, confidence, and primary pollutant', () => {
    render(<TelemetryCards telemetry={mockTelemetry} language="en" />);

    expect(screen.getByText('204')).toBeInTheDocument();
    expect(screen.getByText(/very unhealthy/i)).toBeInTheDocument();
    expect(screen.getByText('96.6 µg/m³')).toBeInTheDocument();
    expect(screen.getByText('Telemetry Confidence: 90%')).toBeInTheDocument();
    expect(screen.getByText('VERIFIED')).toBeInTheDocument();
  });

  it('renders TelemetryCards with various AQI categories correctly', () => {
    const { rerender } = render(
      <TelemetryCards telemetry={{ ...mockTelemetry, aqiCategory: 'Good' }} language="en" />
    );
    expect(screen.getByText(/good/i)).toBeInTheDocument();

    rerender(
      <TelemetryCards telemetry={{ ...mockTelemetry, aqiCategory: 'Moderate' }} language="en" />
    );
    expect(screen.getByText(/moderate/i)).toBeInTheDocument();

    rerender(
      <TelemetryCards
        telemetry={{ ...mockTelemetry, aqiCategory: 'Unhealthy for Sensitive Groups' }}
        language="en"
      />
    );
    expect(screen.getByText(/unhealthy for sensitive groups/i)).toBeInTheDocument();

    rerender(
      <TelemetryCards telemetry={{ ...mockTelemetry, aqiCategory: 'Unhealthy' }} language="en" />
    );
    expect(screen.getByText(/unhealthy/i)).toBeInTheDocument();

    rerender(
      <TelemetryCards telemetry={{ ...mockTelemetry, aqiCategory: 'Hazardous' }} language="en" />
    );
    expect(screen.getByText(/hazardous/i)).toBeInTheDocument();
  });

  it('renders ChemicalMatrix with all 6 pollutants', () => {
    render(<ChemicalMatrix telemetry={mockTelemetry} language="en" />);

    expect(screen.getByText('PM2.5')).toBeInTheDocument();
    expect(screen.getByText('PM10')).toBeInTheDocument();
    expect(screen.getByText('NO₂')).toBeInTheDocument();
    expect(screen.getByText('SO₂')).toBeInTheDocument();
    expect(screen.getByText('O₃')).toBeInTheDocument();
    expect(screen.getByText('CO')).toBeInTheDocument();
  });

  it('renders LifestyleSimulator and triggers input callbacks on user interactions', () => {
    const onInputChange = vi.fn();

    render(
      <LifestyleSimulator
        inputs={mockInputs}
        onInputChange={onInputChange}
        outputs={mockOutputs}
        language="en"
      />
    );

    expect(screen.getByText('1258.4')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();

    // Click Metro Rail mode
    fireEvent.click(screen.getByText('Metro Rail / Electric Bus'));
    expect(onInputChange).toHaveBeenCalledWith({
      ...mockInputs,
      commuteMode: 'metro_electric_bus',
    });

    // Click N95 mask
    fireEvent.click(screen.getByText('N95 / FFP2 Respirator'));
    expect(onInputChange).toHaveBeenCalledWith({
      ...mockInputs,
      maskGrade: 'n95_ffp2',
    });

    // Toggle HEPA
    const toggle = screen.getByRole('switch');
    fireEvent.click(toggle);
    expect(onInputChange).toHaveBeenCalledWith({
      ...mockInputs,
      indoorHepaActive: true,
    });

    // Test sliders
    const distSlider = screen.getByLabelText('Commute Distance in Kilometers');
    fireEvent.change(distSlider, { target: { value: '25' } });
    expect(onInputChange).toHaveBeenCalledWith({
      ...mockInputs,
      commuteDistanceKm: 25,
    });

    const cardioSlider = screen.getByLabelText('Outdoor high-ventilation exercise hours per day');
    fireEvent.change(cardioSlider, { target: { value: '2' } });
    expect(onInputChange).toHaveBeenCalledWith({
      ...mockInputs,
      outdoorCardioHours: 2,
    });
  });

  it('renders ActionPlanSection with placeholder when null and directives when loaded', () => {
    const onGenerate = vi.fn();

    const { rerender } = render(
      <ActionPlanSection
        actionPlan={null}
        isLoading={false}
        onGeneratePlan={onGenerate}
        language="en"
      />
    );

    expect(screen.getByText(/Click "Generate Personalized Action Plan"/i)).toBeInTheDocument();

    const mockPlan: ActionPlanResponse = {
      cityId: 'delhi_ncr',
      cityName: 'Delhi NCR',
      compositeAqi: 204,
      primaryPollutant: 'PM2.5',
      executiveSummary: 'Meteorological advisory for Delhi NCR',
      engineSource: 'AerisPulse Deterministic Rules Engine (Zero-Downtime Fallback)',
      generatedAt: new Date().toISOString(),
      directives: [
        {
          category: 'indoor',
          title: 'Enact True HEPA Indoor Recirculation',
          urgency: 'CRITICAL',
          description: 'Seal building windows',
          impactMetricLabel: 'Impact Metric:',
          impactMetricValue: '85% Indoor PM2.5 Deposition Reduction',
        },
        {
          category: 'commute',
          title: 'Mandatory N95 Transit',
          urgency: 'HIGH',
          description: 'Use metro',
          impactMetricLabel: 'Impact Metric:',
          impactMetricValue: '95% Commute Inhaled Dose Abatement',
        },
        {
          category: 'health',
          title: 'Postpone Outdoor Cardio',
          urgency: 'MODERATE',
          description: 'Shift indoors',
          impactMetricLabel: 'Impact Metric:',
          impactMetricValue: '60% Pulmonary Stress Reduction',
        },
        {
          category: 'community',
          title: 'Report Waste Burning',
          urgency: 'LOW',
          description: 'Call hotline',
          impactMetricLabel: 'Impact Metric:',
          impactMetricValue: 'Air basin protection',
        },
      ],
    };

    rerender(
      <ActionPlanSection
        actionPlan={mockPlan}
        isLoading={false}
        onGeneratePlan={onGenerate}
        language="en"
      />
    );

    expect(screen.getByText('Meteorological advisory for Delhi NCR')).toBeInTheDocument();
    expect(screen.getByText('Enact True HEPA Indoor Recirculation')).toBeInTheDocument();
  });

  it('renders Footer with methodology and WCAG verification links', () => {
    render(<Footer language="en" />);

    expect(screen.getByText(/AerisPulse — Peer-Reviewed Climate & Atmospheric Health System/i)).toBeInTheDocument();
    expect(screen.getByText('WCAG 2.2 AA Verified')).toBeInTheDocument();
  });
});
