import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '@/app/page';

describe('Home Page Full Integration Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders complete AerisPulse dashboard and all key sections', () => {
    render(<Home />);

    expect(screen.getByText('AerisPulse')).toBeInTheDocument();
    expect(screen.getByText('Delhi NCR')).toBeInTheDocument();
    expect(screen.getByText(/Live Atmospheric Telemetry/i)).toBeInTheDocument();
    expect(screen.getByText(/Interactive What-If Lifestyle Simulator/i)).toBeInTheDocument();
    expect(screen.getByText(/Structured GenAI Action Engine/i)).toBeInTheDocument();
    expect(screen.getByText(/Grounded Real-Time Atmospheric Assistant/i)).toBeInTheDocument();
  });

  it('switches presets and triggers telemetry update', async () => {
    const mockTelemetry = {
      cityId: 'mumbai_coastal',
      cityName: 'Mumbai Coastal',
      timestamp: new Date().toISOString(),
      aqiUs: 142,
      aqiCategory: 'Unhealthy for Sensitive Groups',
      primaryPollutant: 'PM2.5',
      primaryPollutantConcentration: 52.4,
      europeanCaqi: 58,
      confidenceScore: 92,
      isVerified: true,
      modelSource: 'Open-Meteo CAMS Atmospheric Model (Active Multi-Station Synthesis)',
      coordinates: { latitude: 19.07, longitude: 72.87 },
      pollutants: {
        pm25: 52.4,
        pm10: 78.0,
        no2: 34.2,
        so2: 14.5,
        o3: 48.0,
        co: 610.0,
      },
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockTelemetry,
    } as Response);

    render(<Home />);

    const mumbaiBtn = screen.getByText('Mumbai Coastal');
    fireEvent.click(mumbaiBtn);

    await waitFor(() => {
      expect(screen.getByText(/Live Atmospheric Telemetry — Mumbai Coastal/i)).toBeInTheDocument();
    });
  });

  it('toggles dark mode class on document element', () => {
    render(<Home />);

    const toggle = screen.getByLabelText('Switch to dark mode');
    fireEvent.click(toggle);
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    const lightToggle = screen.getByLabelText('Switch to light mode');
    fireEvent.click(lightToggle);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('toggles lifestyle inputs and re-computes mathematical outputs synchronously', () => {
    render(<Home />);

    // Click Metro Rail / Electric Bus
    fireEvent.click(screen.getByText('Metro Rail / Electric Bus'));

    // Click N95 / FFP2 Respirator
    fireEvent.click(screen.getByText('N95 / FFP2 Respirator'));

    // Toggle Indoor True HEPA Purifier
    const hepaSwitch = screen.getByRole('switch');
    fireEvent.click(hepaSwitch);

    // Score updates to 98
    expect(screen.getByText('98')).toBeInTheDocument();
    // Daily carbon abated reaches 2.46
    expect(screen.getByText('2.46')).toBeInTheDocument();
  });

  it('generates personalized action plan when button is clicked', async () => {
    const mockPlan = {
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
      ],
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockPlan,
    } as Response);

    render(<Home />);

    const generateBtn = screen.getByRole('button', { name: /Generate Personalized Action Plan/i });
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(screen.getByText('Meteorological advisory for Delhi NCR')).toBeInTheDocument();
      expect(screen.getByText('Enact True HEPA Indoor Recirculation')).toBeInTheDocument();
    });
  });

  it('switches language between English, Tamil, and Hindi', () => {
    render(<Home />);

    // Switch to Tamil
    fireEvent.click(screen.getByText('தமிழ்'));
    expect(screen.getByText(/பெருநகர முன்னமைவுகள்/i)).toBeInTheDocument();

    // Switch to Hindi
    fireEvent.click(screen.getByText('हिंदी'));
    expect(screen.getByText(/मेट्रो प्रीसेट/i)).toBeInTheDocument();

    // Switch back to English
    fireEvent.click(screen.getByText('EN'));
    expect(screen.getByText(/METRO PRESETS/i)).toBeInTheDocument();
  });

  it('refreshes telemetry when refresh button is clicked', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        cityId: 'delhi_ncr',
        cityName: 'Delhi NCR',
        aqiUs: 205,
        aqiCategory: 'Very Unhealthy',
        primaryPollutant: 'PM2.5',
        primaryPollutantConcentration: 98,
        europeanCaqi: 85,
        confidenceScore: 90,
        isVerified: true,
        modelSource: 'Open-Meteo CAMS Atmospheric Model',
        coordinates: { latitude: 28.61, longitude: 77.21 },
        pollutants: { pm25: 98, pm10: 100, no2: 28, so2: 23, o3: 63, co: 890 },
      }),
    } as Response);

    render(<Home />);

    const refreshBtn = screen.getByLabelText('Refresh live atmospheric telemetry');
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalled();
    });
  });
});
